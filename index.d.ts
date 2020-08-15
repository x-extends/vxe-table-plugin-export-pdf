declare module 'jspdf' {
  export class jsPDF {
    constructor(options: any)
    internal: {
      pageSize: {
        getWidth() :number;
        getHeight() :number;
        setWidth(size: number) :any;
        setHeight(size: number) :any;
      }
    };
    getTextWidth(text: string) :number;
    setFontSize(size: number): any;
    addFont(postScriptName: string, id: string, fontStyle: string, encoding?: any): any;
    setFont(fontName: string, fontStyle: string): any;
    table(x: number, y: number, row: any[], headers: any[], options?: any): any;
    text(text: string | string[], x: number, y: number, optionsopt?: any, transform?: any): any;
    save(filename: string): any;
  }
  export default jsPDF
}
