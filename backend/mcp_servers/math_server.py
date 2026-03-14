def tool_math_calculate(expr: str) -> str:
    """Calculates a mathematical expression."""
    import ast
    import operator

    def eval_expr(node):
        if isinstance(node, ast.Num):
            return node.n
        elif isinstance(node, ast.BinOp):
            return operators[type(node.op)](eval_expr(node.left), eval_expr(node.right))
        elif isinstance(node, ast.UnaryOp):
            return operators[type(node.op)](eval_expr(node.operand))
        else:
            raise TypeError(node)

    operators = {
        ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul,
        ast.Div: operator.truediv, ast.Pow: operator.pow, ast.BitXor: operator.xor,
        ast.USub: operator.neg
    }

    try:
        return str(eval_expr(ast.parse(expr, mode='eval').body))
    except Exception as e:
        return f"Fehler bei Berechnung: {str(e)}"
