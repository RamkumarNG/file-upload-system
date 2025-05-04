import axios from 'axios';
import { QueryFunctionContext } from '@tanstack/react-query';
import { File as FileType } from '../types/file';
import { StorageInfo } from '../components/types/types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

interface FileQueryResponse {
    results: FileType[];
    meta: any;
}
  

export const fileService = {
  async uploadFile(file: File): Promise<FileType> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_URL}/files/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getFiles({ queryKey }: QueryFunctionContext<[string, any, string, number]>): Promise<FileQueryResponse> {
    const [_, filters, search, pageNum=1] = queryKey;

    const payload = {
      "page_num": pageNum,
      "filters": filters,
      "query": search,
    };
  
    const response = await axios.post(`${API_URL}/search/`, payload);
    return {
      results: response?.data?.results ?? [],
      meta: response?.data?.meta ?? {},
    };
  },

  async deleteFile(id: string): Promise<void> {
    await axios.delete(`${API_URL}/files/${id}/`);
  },

  async downloadFile(fileUrl: string, filename: string): Promise<void> {
    try {
      const response = await axios.get(fileUrl, {
        responseType: 'blob',
      });
      
      // Create a blob URL and trigger download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      throw new Error('Failed to download file');
    }
  },

  async getMetaInfo(): Promise<void> {
    const response = await axios.get(`${API_URL}/meta-info`)
    return response.data.data;
  },

  async getStorage(): Promise<StorageInfo> {
    const response = await axios.get(`${API_URL}/files/get_storage/`)
    return response.data.data;
  },
}; 