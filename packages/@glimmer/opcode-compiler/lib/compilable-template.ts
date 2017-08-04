import {
  Option,
  SymbolTable
} from '@glimmer/interfaces';
import { Statement } from '@glimmer/wire-format';
import { DEBUG } from '@glimmer/local-debug-flags';
import { debugSlice } from './debug';
import { Handle } from './interfaces';
import { CompilableTemplate as ICompilableTemplate, ParsedLayout } from './interfaces';
import { CompileOptions, compileStatements } from './syntax';;

export { ICompilableTemplate };

export default class CompilableTemplate<S extends SymbolTable> implements ICompilableTemplate<S> {
  private compiled: Option<Handle> = null;

  constructor(private statements: Statement[], private containingLayout: ParsedLayout, private options: CompileOptions, public symbolTable: S) {}

  compile(): Handle {
    let { compiled } = this;
    if (compiled !== null) return compiled;

    let { options, statements, containingLayout } = this;
    let { program } = options;

    let builder = compileStatements(statements, containingLayout, options);
    let handle = builder.commit(program.heap);

    if (DEBUG) {
      let { heap } = program;
      let start = heap.getaddr(handle);
      let end = start + heap.sizeof(handle);
      debugSlice(program, start, end);
    }

    return (this.compiled = handle);
  }
}