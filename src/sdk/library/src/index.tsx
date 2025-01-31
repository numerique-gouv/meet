import { createRoot } from 'react-dom/client';

import { DEFAULT_CONFIG } from '@/Config';
import { FileExplorer, FileExplorerProps } from '@/FileExplorer';
import { ConfigType } from '@/Types';
import '@/index.scss';

// eslint-disable-next-line react-refresh/only-export-components
export * from '@/Types';

export class WidgedClient {
  config: ConfigType;

  constructor(customConfig: Partial<ConfigType> = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...customConfig,
    };
  }

  pickFile(props: Omit<FileExplorerProps, 'config'>) {
    createRoot(this.getRootNode()).render(
      <FileExplorer {...props} config={this.config} />,
    );
  }

  private getRootNode() {
    const ROOT_ID = 'widged-root';
    const existingNode = document.getElementById(ROOT_ID);
    if (existingNode) {
      return existingNode;
    }

    const node = document.createElement('div');
    node.id = ROOT_ID;

    const body = document.getElementsByTagName('body')[0];
    body.append(node);
    return node;
  }
}
