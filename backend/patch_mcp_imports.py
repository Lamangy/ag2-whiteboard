import re

with open("backend/main.py", "r") as f:
    content = f.read()

old_imports = """from file_server import tool_list_files"""
new_imports = """from file_server import tool_list_files, tool_save_file, tool_analyze_folder, tool_rename_file, tool_search_logs, tool_create_backup"""
content = content.replace(old_imports, new_imports)

old_mcp_block = """                        elif mcp_id == "mcp-file":
                            agent.register_for_llm(name="tool_list_files", description="Lists files in a given directory")(tool_list_files)
                            user_proxy.register_for_execution(name="tool_list_files")(tool_list_files)"""

new_mcp_block = """                        elif mcp_id == "mcp-file":
                            # Note: the file server doesn't take savePath directly as an argument, it expects the LLM to pass absolute paths.
                            # The instructions said "We can select the storage location using the explorer function in the right sidebar... The MCP server must also be used for..."
                            # So we will inject the save_path into the system prompt of the agent using this file server so it knows where its default workspace is.
                            # Actually, we can't easily modify the agent's system message here. Let's just bind savePath to a wrapper for tool_save_file.

                            def custom_tool_save_file(content: str, filename: str):
                                import os
                                final_path = os.path.join(save_loc, filename) if save_loc else filename
                                return tool_save_file(content, final_path)

                            def custom_tool_list_files(path: str = ""):
                                target_path = path if path else save_loc if save_loc else "."
                                return tool_list_files(target_path)

                            def custom_tool_analyze_folder(path: str = ""):
                                target_path = path if path else save_loc if save_loc else "."
                                return tool_analyze_folder(target_path)

                            agent.register_for_llm(name="tool_list_files", description="Lists files in a given directory. Use empty string for default workspace.")(custom_tool_list_files)
                            user_proxy.register_for_execution(name="tool_list_files")(custom_tool_list_files)

                            agent.register_for_llm(name="tool_save_file", description="Saves text content to a file. Provide filename.")(custom_tool_save_file)
                            user_proxy.register_for_execution(name="tool_save_file")(custom_tool_save_file)

                            agent.register_for_llm(name="tool_analyze_folder", description="Analyzes a folder structure.")(custom_tool_analyze_folder)
                            user_proxy.register_for_execution(name="tool_analyze_folder")(custom_tool_analyze_folder)

                            agent.register_for_llm(name="tool_rename_file", description="Renames or moves a file.")(tool_rename_file)
                            user_proxy.register_for_execution(name="tool_rename_file")(tool_rename_file)

                            agent.register_for_llm(name="tool_search_logs", description="Searches for a keyword in files.")(tool_search_logs)
                            user_proxy.register_for_execution(name="tool_search_logs")(tool_search_logs)

                            agent.register_for_llm(name="tool_create_backup", description="Creates a zip backup.")(tool_create_backup)
                            user_proxy.register_for_execution(name="tool_create_backup")(tool_create_backup)"""

content = content.replace(old_mcp_block, new_mcp_block)

with open("backend/main.py", "w") as f:
    f.write(content)
