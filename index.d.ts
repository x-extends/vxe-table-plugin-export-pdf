declare module 'jspdf' {
  export class jsPDF {
    constructor(options: any)
    addFont(postScriptName: string, id: string, fontStyle: string, encoding?: any): any;
    setFont(fontName: string, fontStyle: string): any;
    table(x: number, y: number, row: any[], headers: any[], options?: any): any;
    save(filename: string): any;
  }
  export default jsPDF
}
