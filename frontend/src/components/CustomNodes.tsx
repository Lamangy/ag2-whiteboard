import { Handle, Position } from '@xyflow/react';
import { Bot, Network, Wrench, Server, Repeat } from 'lucide-react';

export function BaseNode({ data, selected }: any) {
  return (
    <div className={`node-base bg-white border-slate-300 shadow-md rounded-xl p-4 hover:shadow-xl transition-shadow border-2 ${selected ? 'ring-2 ring-blue-400' : ''}`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-slate-400" />
      <div className="flex items-center gap-2 mb-2 text-slate-700">
        <Network size={16} />
        <span className="font-bold text-sm">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-slate-400" />
    </div>
  );
}

export function AgentNode({ data, selected }: any) {
  const isGroup = data.type === 'groupchat';
  return (
    <div className={`node-base bg-white shadow-md rounded-xl p-4 hover:shadow-xl transition-shadow border-2 ${isGroup ? 'border-purple-400' : 'border-green-400'} ${selected ? (isGroup ? 'ring-2 ring-purple-500' : 'ring-2 ring-green-500') : ''}`}>
      <Handle type="target" position={Position.Left} className={`w-3 h-3 ${isGroup ? 'bg-purple-500' : 'bg-green-500'}`} />
      <div className={`flex items-center gap-2 ${isGroup ? 'text-purple-700' : 'text-green-700'}`}>
        <Bot size={16} />
        <span className="font-bold text-sm truncate">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Right} className={`w-3 h-3 ${isGroup ? 'bg-purple-500' : 'bg-green-500'}`} />
    </div>
  );
}

export function ToolNode({ data, selected }: any) {
  return (
    <div className={`node-base bg-orange-50 border-orange-400 shadow-md rounded-xl p-4 hover:shadow-xl transition-shadow border-2 ${selected ? 'ring-2 ring-orange-500' : ''}`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-orange-500" />
      <div className="flex items-center gap-2 mb-2 text-orange-700">
        <Wrench size={16} />
        <span className="font-bold text-sm">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-orange-500" />
    </div>
  );
}

export function McpNode({ data, selected }: any) {
  return (
    <div className={`node-base bg-indigo-50 border-indigo-400 shadow-md rounded-xl p-4 hover:shadow-xl transition-shadow border-2 ${selected ? 'ring-2 ring-indigo-500' : ''}`}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-indigo-500" />
      <div className="flex items-center gap-2 mb-2 text-indigo-700">
        <Server size={16} />
        <span className="font-bold text-sm">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-indigo-500" />
    </div>
  );
}

// NEU: Der Iterator Knoten
export function IteratorNode({ data, selected }: any) {
  return (
    <div className={`node-base bg-yellow-50 border-yellow-400 shadow-md rounded-xl p-4 hover:shadow-xl transition-shadow border-2 relative ${selected ? 'ring-2 ring-yellow-500' : ''}`} style={{ minHeight: '100px' }}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-yellow-500" />
      
      <div className="flex items-center gap-2 mb-2 text-yellow-700">
        <Repeat size={16} />
        <span className="font-bold text-sm">{data.label}</span>
      </div>
      <div className="text-xs text-slate-600 leading-tight">Nimmt JSON-Liste und führt Loop aus</div>

      {/* Ausgang 1: Der Loop für den Single-Agenten */}
      <Handle type="source" position={Position.Right} id="loop" style={{ top: '35%', background: '#eab308', width: '12px', height: '12px' }} />
      <div className="text-[10px] text-yellow-700 font-bold absolute right-4 top-[29%]">Loop ↻</div>

      {/* Ausgang 2: Wenn der Loop fertig ist, gehts hier weiter */}
      <Handle type="source" position={Position.Right} id="next" style={{ top: '75%', background: '#64748b', width: '12px', height: '12px' }} />
      <div className="text-[10px] text-slate-600 font-bold absolute right-4 top-[69%]">Next ➔</div>
    </div>
  );
}