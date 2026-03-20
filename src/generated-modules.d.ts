declare module 'figma:asset/*' {
  const src: string;
  export default src;
}

declare module '*@*' {
  const value: any;
  export = value;
}
