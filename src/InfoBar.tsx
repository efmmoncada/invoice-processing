import { Card, CardBody, CardHeader } from "@nextui-org/react";

type Props = {
    totalFilesUploaded: number;
    totalPagesToProcess: number;
    totalPagesProcessed: number;
}

export const InfoBar = ({ totalFilesUploaded, totalPagesToProcess, totalPagesProcessed }: Props) => {

    return (
        <Card shadow="none">
            <CardHeader>Processing Info</CardHeader>
            <CardBody>
                <p>Total Files Uploaded: {totalFilesUploaded}</p>
                <p>Total Pages to Process: {totalPagesToProcess}</p>
                <p>Total Pages Processed: {totalPagesProcessed}</p>
            </CardBody>
        </Card>
    )
}