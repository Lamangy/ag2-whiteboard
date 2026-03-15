import { useState, useCallback, useMemo } from 'react';
import { ReactFlow, Background, BackgroundVariant, Controls, applyNodeChanges, applyEdgeChanges, addEdge, ReactFlowProvider, useReactFlow } from '@xyflow/react';
import type { NodeChange, EdgeChange, Connection, Edge, Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Save, FolderOpen, Trash2, X, Play, AlertTriangle, CheckCircle, Settings as SettingsIcon } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import SettingsModal from './components/SettingsModal';
import { AgentNode, BaseNode, ToolNode, McpNode, IteratorNode } from './components/CustomNodes';

const checkConnectionRules = (sourceNode: Node, targetNode: Node) => {
  const sType = sourceNode.type, tType = targetNode.type;
  if (sourceNode.id === targetNode.id) return { valid: false, message: "Ein Element kann nicht mit sich selbst verbunden werden." };
  
  if (sType === 'agent' && tType === 'groupchat') return { valid: true, message: "" };
  if (sType === 'groupchat' && tType === 'node') return { valid: true, message: "" };
  
  // NEU: Iterator Regeln
  if (sType === 'groupchat' && tType === 'iterator') return { valid: true, message: "" };
  if (sType === 'iterator' && tType === 'agent') return { valid: true, message: "" };
  if (sType === 'iterator' && tType === 'node') return { valid: true, message: "" };

  if (sType === 'node' && (tType === 'mcp' || tType === 'tool')) return { valid: false, message: "Node kann nicht direkt mit Tool verbunden werden." };
  if (sType === 'tool' && tType === 'tool') return { valid: false, message: "Tools geben Resultate an Agenten weiter." };
  return { valid: true, message: "" };
};

function PipelineBuilder() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [finalResult, setFinalResult] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [totalTokens, setTotalTokens] = useState<number>(0);
  
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [savedBlueprints, setSavedBlueprints] = useState<any[]>([]);
  const [presetBlueprints, setPresetBlueprints] = useState<any[]>([]);
  const [activeLoadTab, setActiveLoadTab] = useState<'saved' | 'presets'>('saved');

  const { screenToFlowPosition } = useReactFlow();

  const selectedNode = nodes.find(n => n.selected) || null;
  const nodeTypes = useMemo(() => ({ agent: AgentNode, groupchat: AgentNode, node: BaseNode, tool: ToolNode, mcp: McpNode, iterator: IteratorNode }), []);

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

  const isValidConnection = useCallback((connection: Edge | Connection) => {
    const sourceNode = nodes.find((n) => n.id === connection.source);
    const targetNode = nodes.find((n) => n.id === connection.target);
    return sourceNode && targetNode ? checkConnectionRules(sourceNode, targetNode).valid : false;
  }, [nodes]);

  const onConnect = useCallback((connection: Connection) => {
    const sourceNode = nodes.find((n) => n.id === connection.source);
    const targetNode = nodes.find((n) => n.id === connection.target);
    if (sourceNode && targetNode) {
      const { valid, message } = checkConnectionRules(sourceNode, targetNode);
      if (!valid) {
        setConnectionError(message);
        setTimeout(() => setConnectionError(null), 4000);
        return;
      }
    }
    setEdges((eds) => addEdge({ ...connection, animated: true, style: { stroke: '#64748b', strokeWidth: 2 } }, eds));
  }, [nodes]);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    const dataStr = event.dataTransfer.getData('application/elementData');
    if (!type || !dataStr) return;
    const elementData = JSON.parse(dataStr);
    
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });

    const newNode = {
      id: `${elementData.id}-${Date.now()}`, type: type, position,
      data: { label: elementData.name, provider: 'gemini', prompt: '', strictMode: true, ...elementData },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [screenToFlowPosition]);

  const onDragOver = useCallback((event: React.DragEvent) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }, []);

  const updateNodeData = useCallback((id: string, newData: any) => {
    setNodes((nds) => nds.map((node) => node.id === id ? { ...node, data: { ...node.data, ...newData } } : node));
  }, []);

  const deleteNode = useCallback((id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  }, []);

  const handleSaveBoard = async () => {
    if (nodes.length === 0) return alert("Das Board ist leer!");
    const name = prompt("Bitte gib einen Namen für dieses Blueprint ein:", "Meine Pipeline");
    if (!name) return;
    try {
      await axios.post('http://localhost:8000/elements', { id: `bp-${Date.now()}`, name, nodes, edges });
      alert("Erfolgreich gespeichert!");
    } catch (e) { alert("Fehler beim Speichern."); }
  };

  const handleOpenLoadModal = async () => {
    try {
      const res = await axios.get('http://localhost:8000/elements');
      setSavedBlueprints(res.data);
      const resPresets = await axios.get('http://localhost:8000/preset_blueprints');
      setPresetBlueprints(resPresets.data);
      setShowLoadModal(true);
    } catch (e) { alert("Fehler beim Abrufen der Blueprints."); }
  };

  const handleStartPipeline = async () => {
    if (nodes.length === 0) return alert("Das Whiteboard ist leer.");
    setShowLogs(true); setShowResult(false); setTerminalLogs(["[System] Sende Pipeline an Backend..."]);

    try {
      const response = await axios.post('http://localhost:8000/pipeline/start', { id: `bp-${Date.now()}`, name: "Live", nodes, edges });
      const taskId = response.data.task_id;
      const interval = setInterval(async () => {
        try {
          const statusRes = await axios.get(`http://localhost:8000/pipeline/status/${taskId}`);
          setTerminalLogs(statusRes.data.logs);
          if (statusRes.data.status === 'completed' || statusRes.data.status === 'failed') {
            clearInterval(interval);
            if (statusRes.data.status === 'completed') {
              setFinalResult(statusRes.data.result.final_output);
              if (statusRes.data.result.tokens) setTotalTokens(prev => prev + statusRes.data.result.tokens);
              setShowResult(true);
            }
          }
        } catch (error) { clearInterval(interval); }
      }, 1000);
    } catch (error) { setTerminalLogs(prev => [...prev, `[Fehler] Konnte Pipeline nicht starten.`]); }
  };

  return (
    <div className="app-container flex flex-col h-screen">
      <header className="header shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-slate-800">AG2 Pipeline Builder</h1>
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-1 rounded-full text-xs font-mono font-bold ml-4 flex items-center gap-2">
            <span>Tokens:</span><span className="text-blue-600 text-sm">{totalTokens.toLocaleString()}</span>
          </div>
          <button onClick={handleSaveBoard} className="p-2 text-slate-600 hover:bg-slate-100 rounded ml-4" title="Speichern"><Save size={20} /></button>
          <button onClick={handleOpenLoadModal} className="p-2 text-slate-600 hover:bg-slate-100 rounded" title="Laden"><FolderOpen size={20} /></button>
          <button onClick={() => {if(window.confirm("Whiteboard leeren?")) {setNodes([]); setEdges([]);}}} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Leeren"><Trash2 size={20} /></button>
        </div>
        <div className="flex items-center gap-4">
          {/* HIER IST DEIN EINSTELLUNGS-BUTTON ZURÜCK! */}
          <button onClick={() => setShowSettingsModal(true)} className="px-4 py-2 bg-slate-100 border border-slate-300 rounded font-medium text-sm hover:bg-slate-200 flex items-center gap-2">
            <SettingsIcon size={16} /> Einstellungen
          </button>
          <button onClick={handleStartPipeline} className="px-4 py-2 bg-green-600 text-white rounded font-medium text-sm hover:bg-green-700 flex items-center gap-2"><Play size={16} /> Pipeline starten</button>
        </div>
      </header>

      <div className="main-content flex flex-1 overflow-hidden relative">
        <LeftSidebar />
        <div className="whiteboard-wrapper flex-1 relative" onDrop={onDrop} onDragOver={onDragOver}>
          {connectionError && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-100 text-red-700 px-4 py-3 rounded shadow-lg flex items-center gap-3 animate-bounce">
              <AlertTriangle size={20} /> <span className="font-medium text-sm">{connectionError}</span>
              <button onClick={() => setConnectionError(null)} className="ml-2"><X size={16}/></button>
            </div>
          )}
          <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} isValidConnection={isValidConnection} deleteKeyCode={["Backspace", "Delete"]}>
            <Background variant={BackgroundVariant.Dots} gap={20} size={2} color="#ef4444" />
            <Controls />
          </ReactFlow>
          
          {showLogs && (
            <div className="floating-window" style={{ bottom: '20px', left: '20px', width: '500px', height: '300px' }}>
              <div className="floating-window-header"><span>Live-Logs</span><button onClick={() => setShowLogs(false)}><X size={18} /></button></div>
              <div className="floating-window-content terminal-logs flex flex-col gap-1">
                {terminalLogs.map((log, index) => (<div key={index} className={log.includes('❌') ? 'text-red-400' : ''}>{log}</div>))}
              </div>
            </div>
          )}
          {showResult && finalResult && (
            <div className="floating-window shadow-2xl rounded-xl border border-gray-300" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '900px', height: '85vh', display: 'flex', flexDirection: 'column', zIndex: 1000 }}>
              <div className="floating-window-header bg-green-50 border-b border-green-200 p-4 flex justify-between items-center">
                <span className="text-green-800 font-bold flex items-center gap-2 text-lg"><CheckCircle size={24} /> Finales Pipeline-Ergebnis</span>
                <button onClick={() => setShowResult(false)} className="text-green-700 hover:text-black transition-colors"><X size={24} /></button>
              </div>
              <div className="floating-window-content p-8 bg-white overflow-y-auto flex-1">
                <ReactMarkdown components={{ h1: ({node, ...props}) => <h1 className="text-3xl font-bold mb-6 mt-4 text-slate-900 border-b pb-2" {...props} />, h2: ({node, ...props}) => <h2 className="text-2xl font-bold mb-4 mt-8 text-slate-800" {...props} />, p: ({node, ...props}) => <p className="mb-5 text-slate-700 leading-relaxed text-base" {...props} />, ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-5 text-slate-700 space-y-2 text-base" {...props} /> }}>
                  {finalResult}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
        <RightSidebar selectedNode={selectedNode} updateNodeData={updateNodeData} deleteNode={deleteNode} />
      </div>

      {/* HIER SIND DIE MODALS WIEDER DRIN */}
      {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} />}
      
      {showLoadModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-[500px] max-h-[80vh] flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b bg-slate-50 flex justify-between items-center">
              <span className="font-bold text-slate-700">Blueprint laden</span>
              <button onClick={() => setShowLoadModal(false)} className="text-slate-400 hover:text-slate-700"><X size={18} /></button>
            </div>
            <div className="flex border-b">
              <button onClick={() => setActiveLoadTab('saved')} className={`flex-1 py-2 text-sm font-bold ${activeLoadTab === 'saved' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}>Eigene ({savedBlueprints.length})</button>
              <button onClick={() => setActiveLoadTab('presets')} className={`flex-1 py-2 text-sm font-bold ${activeLoadTab === 'presets' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}>Vorlagen ({presetBlueprints.length})</button>
            </div>
            <div className="p-4 flex flex-col gap-2 overflow-y-auto flex-1">
              {activeLoadTab === 'saved' && (
                savedBlueprints.length === 0 ? <p className="text-sm text-slate-500">Keine eigenen Blueprints gefunden.</p> :
                  savedBlueprints.map(bp => (
                    <button key={bp.id} onClick={() => {setNodes(bp.nodes); setEdges(bp.edges); setShowLoadModal(false);}} className="text-left px-3 py-2 border rounded hover:bg-slate-50 text-sm font-medium text-slate-700">{bp.name}</button>
                  ))
              )}
              {activeLoadTab === 'presets' && (
                presetBlueprints.length === 0 ? <p className="text-sm text-slate-500">Keine Vorlagen gefunden.</p> :
                  presetBlueprints.map(bp => (
                    <button key={bp.id} onClick={() => {setNodes(bp.nodes); setEdges(bp.edges); setShowLoadModal(false);}} className="text-left px-3 py-2 border rounded hover:bg-slate-50 text-sm font-medium text-slate-700">{bp.name}</button>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() { return <ReactFlowProvider><PipelineBuilder /></ReactFlowProvider>; }