import { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as pdfjs from 'pdfjs-dist';
import { accounts } from './accounts';
import { PDFDocument, rgb } from 'pdf-lib';
import { Button } from '@nextui-org/react';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const App = () => {
  const [workingPdf, setWorkingPdf] = useState<string>();
  const inputPdf = useRef<PDFDocument>();
  const outputPdf = useRef<PDFDocument>();
  const [pagesPresent, setPagesPresent] = useState(false);
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    (async () => {
      inputPdf.current = await PDFDocument.create();
      outputPdf.current = await PDFDocument.create();
    })();
  }, []);

  useEffect(() => {
    if (inputPdf.current?.getPageCount() || 0 > 0) setPagesPresent(true);
    else setPagesPresent(false);
  }, [inputPdf.current?.getPageCount()]);

  const onDownload = useCallback(async () => {
    const stampedPDF = await outputPdf.current?.save();

    if (!stampedPDF) return;

    const blob = new Blob([stampedPDF], { type: 'application/pdf' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'test';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  //@ts-expect-error
  const onDrop = useCallback(async (acceptedFiles) => {
    for (const file of acceptedFiles) {
      const reader = new FileReader();

      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = async (e) => {
        const uri = e.target?.result as string;

        const srcDoc = await PDFDocument.load(uri);
        const copiedPages = await inputPdf.current?.copyPages(
          srcDoc,
          srcDoc.getPageIndices(),
        );

        for (const p of copiedPages || []) {
          inputPdf.current?.addPage(p);
        }

        const currUri = await inputPdf.current?.saveAsBase64({ dataUri: true });
        setWorkingPdf(currUri);
      };

      reader.readAsDataURL(file);
    }
  }, []);

  const reset = useCallback(async () => {
    delete inputPdf.current;
    inputPdf.current = await PDFDocument.create();
    delete outputPdf.current;
    outputPdf.current = await PDFDocument.create();

    setProcessed(false);
    setPagesPresent(false);
  }, []);

  const processFiles = useCallback(async () => {
    const correspondingAcctNumbers = [];

    const uri = await inputPdf.current?.saveAsBase64({ dataUri: true });
    const bstring = atob(uri?.split(',')[1] || '');
    const bytes = new Uint8Array(bstring.length);
    for (let i = 0; i < bstring.length; i++) {
      bytes[i] = bstring.charCodeAt(i);
    }

    const doc = await pdfjs.getDocument({ data: bytes }).promise;
    for (let i = 0; i < doc.numPages; i++) {
      const page = await doc.getPage(i + 1);
      const textContent = await page.getTextContent();

      const text = textContent.items.map((item) => (item as any).str).join(' ');
      let accountNum = Number(
        text
          .match(/(?<=ACCOUNT NUMBER) *\d+/)
          ?.toString()
          .trim(),
      );

      if (!accountNum) {
        const accountNumbersRegex = new RegExp(Object.keys(accounts).map(k => k.toString()).join('|'));
        accountNum = Number(text.match(accountNumbersRegex)?.toString().trim());
      }

      correspondingAcctNumbers.push(accountNum);
    }

    const pdfDoc = await PDFDocument.load(uri || '');
    const pages = pdfDoc.getPages();

    for (let i = 0; i < pages.length; i++) {
      if (!correspondingAcctNumbers[i]) continue;

      const { loc, poNumber, accountCode } =
        accounts[correspondingAcctNumbers[i]];

      const { width, height } = pages[i].getSize();

      pages[i].drawText(`${loc}\nPO #${poNumber}\nAcct: ${accountCode}`, {
        x: 0.4 * width,
        y: 0.97 * height,
        size: 20,
        color: rgb(1, 0, 0),
      });
    }

    const indicies = pdfDoc.getPageIndices();

    const validIndicies = [];

    for (let i = 0; i < correspondingAcctNumbers.length; i++) {
      if (correspondingAcctNumbers[i]) {
        validIndicies.push(indicies[i]);
      }
    }

    const copiedPages = await outputPdf.current?.copyPages(
      pdfDoc,
      validIndicies,
    );
    if (!copiedPages) return;

    for (const p of copiedPages) {
      outputPdf.current?.addPage(p);
    }

    setProcessed(true);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop
  });

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-8 p-6">
      <iframe style={{
        WebkitTransform: "scale(1)"
      }} className="h-4/5 w-full" src={workingPdf} />
      <div
        {...getRootProps({
          className:
            'border-4 rounded-lg border-gray-400 border-dashed w-4/5 h-40 text-3xl flex justfify-center items-center',
        })}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="mx-auto">Drop the files here...</p>
        ) : (
          <p className="mx-auto">
            Drag and drop some files here, or click to select files
          </p>
        )}
      </div>

      <div className='flex gap-3'>
        <Button color="default" variant='shadow' isDisabled={!processed && pagesPresent} onClick={reset}>Reset</Button>
        <Button color="primary" variant='shadow' isDisabled={!pagesPresent} onClick={processFiles}>Process</Button>
        <Button color="success" variant='shadow' isDisabled={!processed} onClick={onDownload}>Download Coded PDF</Button>
      </div>
    </div>
  );
};

export default App;
