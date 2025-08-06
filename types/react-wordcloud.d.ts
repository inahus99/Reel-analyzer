// types/react-wordcloud.d.ts
declare module 'react-wordcloud' {
  import * as React from 'react';

  export interface Word {
    text: string;
    value: number;
    // other optional props if you need
  }

  export interface Options {
    rotations?: number;
    rotationAngles?: [number, number];
    // add more options you use, or use `any`:
    [key: string]: any;
  }

  export interface Callbacks {
    // any callback props you use
    [key: string]: any;
  }

  export default class ReactWordCloud extends React.Component<{
    words: Word[];
    options?: Options;
    callbacks?: Callbacks;
  }> {}
}
