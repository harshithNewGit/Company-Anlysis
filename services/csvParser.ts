export const parseCsvHeaders = (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error("No file provided."));
    }
    
    if (file.size === 0) {
      return reject(new Error("File is empty."));
    }

    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      try {
        const text = event.target?.result as string;
        if (!text) {
          throw new Error("Could not read file content.");
        }
        
        const firstLine = text.split(/\r\n|\n/)[0];
        if (!firstLine) {
            throw new Error("File contains no headers.");
        }

        // Basic CSV parsing for the header line
        const headers = (firstLine.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [])
            .map(header => header.trim())
            .map(header => header.startsWith('"') && header.endsWith('"') ? header.slice(1, -1) : header);
        
        resolve(headers);

      } catch (e) {
        reject(e instanceof Error ? e : new Error("Failed to parse CSV headers."));
      }
    };

    reader.onerror = () => {
      reject(new Error("Error reading the file."));
    };

    // Read only a small chunk of the file to get the header
    const blob = file.slice(0, 1024);
    reader.readAsText(blob);
  });
};

export const readCsvChunk = (file: File, size: number = 4096): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error("No file provided."));
    }
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      const text = event.target?.result as string;
      if (text) {
        resolve(text);
      } else {
        reject(new Error("Could not read file content."));
      }
    };
    reader.onerror = () => {
      reject(new Error("Error reading the file."));
    };
    const blob = file.slice(0, size);
    reader.readAsText(blob);
  });
};
