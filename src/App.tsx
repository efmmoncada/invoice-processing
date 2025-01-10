import { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as pdfjs from 'pdfjs-dist';
import { accounts } from './accounts';
import { PDFDocument, rgb } from 'pdf-lib';
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@nextui-org/react';
import { InfoBar } from './InfoBar';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const App = () => {
  const inputPdf = useRef<PDFDocument>();
  const [pageMarkupMap, setPageMarkupMap] = useState<Record<number, { location: string, poNumber: string, accountCode: string }>>({});

  const [workingPdf, setWorkingPdf] = useState<string>();
  const [pagePreviewURI, setPagePreviewURI] = useState<string | null>(null);
  const [pagesPresent, setPagesPresent] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [location, setLocation] = useState("");
  const [po, setPo] = useState("");
  const [accountCode, setAccountCode] = useState("");
  const [manualPageIndex, setManualPageIndex] = useState<number | null>(null); // Track which page needs manual input
  const [ambiguousPageIndex, setAmbiguousPageIndex] = useState<number | null>(null); // Track which page needs manual input
  const [totalFilesUploaded, setTotalFilesUploaded] = useState(0);
  const [totalPagesToProcess, setTotalPagesToProcess] = useState(0);
  const [totalPagesProcessed, setTotalPagesProcessed] = useState(0);

  const { onOpen, isOpen, onClose } = useDisclosure();
  const { onOpen: onOpen2, isOpen: isOpen2, onClose: onClose2 } = useDisclosure()

  // @ts-expect-error
  const onDrop = useCallback(async (acceptedFiles) => {
    for (const file of acceptedFiles) {
      const reader = new FileReader();

      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = async (e) => {
        const uri = e.target?.result as string;

        const srcDoc = await PDFDocument.load(uri);
        setTotalPagesToProcess((prev) => prev + srcDoc.getPageCount());
        const copiedPages = await inputPdf.current?.copyPages(
          srcDoc,
          srcDoc.getPageIndices(),
        );

        for (const p of copiedPages || []) {
          inputPdf.current?.addPage(p);
        }

        const currUri = await inputPdf.current?.saveAsBase64({ dataUri: true });
        setWorkingPdf(currUri);
        setTotalFilesUploaded((prev) => prev + 1);
      };

      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop
  });



  const onDownload = useCallback(async () => {
    const stampedPDF = await inputPdf.current?.save();

    if (!stampedPDF) return;

    const blob = new Blob([stampedPDF], { type: 'application/pdf' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'test';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);



  async function populateMarkupMap(start = 0) {

    const pdfBytes = await inputPdf.current?.save();
    const pdf = await pdfjs.getDocument({ data: pdfBytes }).promise;

    for (let i = start; i < pdf.numPages; i++) {
      const page = await pdf.getPage(i + 1);
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

      if (!accountNum) {

      } else if (accountNum === 542494) {
        setAmbiguousPageIndex(i);
        return;

      } else if (!accounts[accountNum]) {
        setManualPageIndex(i);
        return;

      } else {
        const { loc, poNumber, accountCode } = accounts[accountNum];
        setPageMarkupMap((map) => ({ ...map, [i]: { location: loc, poNumber, accountCode } }))
      }
    }
  }

  async function stampPages() {
    if (!inputPdf.current) return;

    const pdf = inputPdf.current;
    const numPages = inputPdf.current?.getPageCount() || 0;

    for (let i = 0; i < numPages; i++) {
      const { width, height } = pdf.getPage(i).getSize();
      const { location, poNumber, accountCode } = pageMarkupMap[i]

      pdf.getPage(i).drawText(`${location}\nPO #${poNumber}\nAcct: ${accountCode}`, {
        x: 0.4 * width,
        y: 0.97 * height,
        size: 20,
        color: rgb(1, 0, 0),
      });
    }

    setTotalPagesProcessed(numPages);
    const result = await pdf.saveAsBase64({ dataUri: true });
    setWorkingPdf(result);
  }

  const renderPage = useCallback(async () => {
    if (!inputPdf.current) return;
    if (manualPageIndex === null && ambiguousPageIndex === null) return;

    let idk = manualPageIndex ?? ambiguousPageIndex;

    const previewPDF = await PDFDocument.create();
    const [previewPage] = await previewPDF.copyPages(inputPdf.current, [idk!]);

    previewPDF.addPage(previewPage);

    const uri = await previewPDF.saveAsBase64({ dataUri: true });
    setPagePreviewURI(uri);


  }, [manualPageIndex, ambiguousPageIndex]);

  const processFiles = useCallback(async () => {
    await populateMarkupMap();
    setProcessed(true);
  }, []);

  const reset = useCallback(async () => {
    delete inputPdf.current;
    inputPdf.current = await PDFDocument.create();

    setProcessed(false);
    setPagesPresent(false);
    setTotalFilesUploaded(0);
    setTotalPagesToProcess(0);
    setTotalPagesProcessed(0);
    setWorkingPdf(undefined);
  }, []);

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
  };
  const handlePoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPo(e.target.value);
  };
  const handleAccountCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccountCode(e.target.value);
  };

  const handleManualTextSubmit = () => {
    if (manualPageIndex !== null) {

      setPageMarkupMap((map) => ({ ...map, [manualPageIndex]: { location, poNumber: po, accountCode } }))

      let idx = manualPageIndex + 1;
      setLocation("");
      setPo("");
      setAccountCode("");
      setManualPageIndex(null); // Clear the page index
      populateMarkupMap(idx); // Continue processing after manual input
    }
  };

  const handleGeneralSubmit = () => {
    if (ambiguousPageIndex !== null) {
      setPageMarkupMap((map) => ({ ...map, [ambiguousPageIndex]: { location: "Facilites", poNumber: "24000826", accountCode: "100.2540.0412.006.000.000" } }))
      let idx = ambiguousPageIndex + 1;
      setAmbiguousPageIndex(null);
      populateMarkupMap(idx);
    }
  };

  const handleGrantSubmit = () => {
    if (ambiguousPageIndex !== null) {
      setPageMarkupMap((map) => ({ ...map, [ambiguousPageIndex]: { location: "Facilities", poNumber: "24001883", accountCode: "254.2540.0410.006.094.490\n254.2540.0410.006.095.490" } }))
      let idx = ambiguousPageIndex + 1;
      setAmbiguousPageIndex(null);
      populateMarkupMap(idx);
    }
  }


  // useEffect(() => {
  //   if (manualPageIndex !== null) {
  //     renderPage();
  //   }
  // }, [manualPageIndex, renderPage]);

  useEffect(() => {
    if (isOpen || isOpen2) {
      renderPage();
    }
  }, [isOpen, isOpen2, renderPage]);

  useEffect(() => {
    (async () => {
      inputPdf.current = await PDFDocument.create();
    })();
  }, []);

  useEffect(() => {
    if (inputPdf.current?.getPageCount() || 0 > 0) setPagesPresent(true);
    else setPagesPresent(false);
  }, [inputPdf.current?.getPageCount()]);

  useEffect(() => {
    (async () => stampPages())();
  }, [pageMarkupMap])

  useEffect(() => {
    if (manualPageIndex !== null) onOpen();
  }, [manualPageIndex])

  useEffect(() => {
    if (ambiguousPageIndex !== null) onOpen2();
    else onClose2();
  }, [ambiguousPageIndex]);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-8 p-6">
      <iframe style={{
        WebkitTransform: "scale(1)"
      }} className="h-4/5 w-full" src={workingPdf} />
      <div className='flex flex-row '>
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
        <InfoBar totalFilesUploaded={totalFilesUploaded} totalPagesToProcess={totalPagesToProcess} totalPagesProcessed={totalPagesProcessed} />
      </div>

      <div className='flex gap-3'>
        <Button color="default" variant='shadow' isDisabled={!processed && pagesPresent} onClick={reset}>Reset</Button>
        <Button color="primary" variant='shadow' isDisabled={!pagesPresent} onClick={() => processFiles()}>Process</Button>
        <Button color="success" variant='shadow' isDisabled={!processed} onClick={onDownload}>Download Coded PDF</Button>
      </div>

      <Modal isOpen={isOpen} hideCloseButton size='5xl'>
        <ModalContent>
          {() => (<>
            <ModalHeader>No Account Info Found - Please enter</ModalHeader>
            <ModalBody className='flex flex-row items-center'>
              <span className='flex-1 h-72'>
                {pagePreviewURI && <iframe className="w-full h-full" src={pagePreviewURI}></iframe>}
              </span>
              <span className='flex flex-col gap-3'>
                <Input value={location} onChange={handleLocationChange} label="Location" />
                <Input value={po} onChange={handlePoChange} label="PO Number" />
                <Input value={accountCode} onChange={handleAccountCodeChange} label="Account Code" />
                <Button color='primary' onClick={() => { handleManualTextSubmit(); onClose(); }}>Save</Button>
              </span>
            </ModalBody>
          </>)}
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpen2} hideCloseButton className='h-screen' size='5xl'>
        <ModalContent>
          {() => (<>
            <ModalHeader>
              Ambiguous Account Number Detected
            </ModalHeader>
            <ModalBody className='flex flex-row items-center'>
              <span className='flex-1 h-full'>
                {pagePreviewURI && <iframe className="w-full h-full" src={pagePreviewURI}></iframe>}
              </span>
            </ModalBody>
            <ModalFooter>
              <p className='text-small'>This page is for the Facilites account code. Should this be coded under the general custodial budget, or the grant?</p>

              <Button color='primary' onClick={handleGeneralSubmit}>General Custodial</Button>
              <Button color='primary' onClick={handleGrantSubmit}>Grant</Button>
            </ModalFooter>
          </>)}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default App;
