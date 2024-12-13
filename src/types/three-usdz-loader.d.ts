declare module 'three-usdz-loader' {
  import { Loader, LoadingManager, Group } from 'three';

  export class USDZLoader extends Loader {
    constructor(manager?: LoadingManager);
    load(url: string, onLoad: (object: Group) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): void;
    parse(data: ArrayBuffer): Group;
  }
} 