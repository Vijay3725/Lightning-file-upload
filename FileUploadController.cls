public with sharing class FileUploadController {
    @AuraEnabled(cacheable=true)
    public static List<ContentDocumentLink> getUploadedFiles(Id recordId) {
        return [
            SELECT ContentDocumentId, ContentDocument.Title, 
            ContentDocument.ContentSize 
            FROM ContentDocumentLink 
            WHERE LinkedEntityId = :recordId
        ];
    }
}