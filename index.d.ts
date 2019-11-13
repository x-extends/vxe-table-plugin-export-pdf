declare module 'jspdf' {
  export class jsPDF {
    constructor(options: any)
    table(x: number, y: number, row: any[], headers: any[], options?: any): any;
    save(filename: string): any;
  }
  export default jsPDF
}