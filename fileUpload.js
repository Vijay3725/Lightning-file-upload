import { LightningElement, api, track, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex'; 
import getUploadedFiles from '@salesforce/apex/FileUploadController.getUploadedFiles';

const COLUMNS = [
        { label: 'File Name', fieldName: 'Title', type: 'text' },
        {label: 'Size (KB)', fieldName: 'ContentSize', type: 'number', cellAttributes: { alignment: 'left' }},
        {
            type: 'button',
            typeAttributes: {
                label: 'Download',
                name: 'download',
                disabled: false,
                iconName: 'utility:download',
                variant: 'brand'
            }
        }
]

export default class FileUploadWithDatatable extends LightningElement {
    @api recordId;
    @track files = [];
    columns = COLUMNS;
    @track showTable = false;
    wiredFilesResult;

    get acceptedFormats(){
        return ['.pdf', '.png', '.jpg', '.jpeg'];
    }

    @wire(getUploadedFiles, { recordId: '$recordId' })
    wiredFiles(result) {
        this.wiredFilesResult = result;
        const { data, error } = result;
        if (data) {
            this.files = data.map(file => ({
                Id: file.ContentDocumentId,
                Title: file.ContentDocument.Title,
                FileType: file.ContentDocument.FileType,
                ContentSize: (file.ContentDocument.ContentSize / 1024).toFixed(2), // convert size to KB
                ContentDownloadUrl: `/sfc/servlet.shepherd/document/download/${file.ContentDocumentId}`
            }));
            this.showTable = this.files.length > 0;
        } else if (error) {
            // Handle error
            console.error('Error retrieving files:', error);
        }
    }

    handleUploadFinished(event) {
        const uploadedFiles = event.detail.files;
        let fileNames = '';
        uploadedFiles.forEach(file => fileNames += file.name + ', ');
        // Refresh the file list after the upload is finished
        refreshApex(this.wiredFilesResult)
            .then(() => {
                this.showTable = this.files.length > 0; // Ensure table is shown after refresh
            });
    }

    

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        if (actionName === 'download') {
            window.open(row.ContentDownloadUrl, '_blank');
        }
    }
}
