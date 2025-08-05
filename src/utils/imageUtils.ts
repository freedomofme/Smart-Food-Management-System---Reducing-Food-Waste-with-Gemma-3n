// 图像处理工具函数
export class ImageUtils {
  // 压缩图片
  static compressImage(
    file: File, 
    maxWidth: number = 800, 
    maxHeight: number = 600, 
    quality: number = 0.8
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // 计算新的尺寸
        const { width, height } = this.calculateNewDimensions(
          img.width, 
          img.height, 
          maxWidth, 
          maxHeight
        );
        
        canvas.width = width;
        canvas.height = height;
        
        // 绘制压缩后的图片
        ctx?.drawImage(img, 0, 0, width, height);
        
        // 转换为Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('图片压缩失败'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = URL.createObjectURL(file);
    });
  }

  // 计算新的图片尺寸（保持宽高比）
  static calculateNewDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };
    
    // 如果图片尺寸超过最大限制，按比例缩放
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }
    
    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }
    
    return { width: Math.round(width), height: Math.round(height) };
  }

  // 将文件转换为Base64
  static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('文件读取失败'));
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsDataURL(file);
    });
  }

  // 将Base64转换为Blob
  static base64ToBlob(base64: string): Blob {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'image/jpeg' });
  }

  // 创建图片预览URL
  static createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  // 释放预览URL
  static revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }

  // 验证图片文件
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    // 检查文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: '不支持的图片格式，请选择 JPEG、PNG 或 WebP 格式的图片'
      };
    }
    
    // 检查文件大小（最大10MB）
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        valid: false,
        error: '图片文件过大，请选择小于10MB的图片'
      };
    }
    
    return { valid: true };
  }

  // 获取图片元数据
  static getImageMetadata(file: File): Promise<{
    width: number;
    height: number;
    size: number;
    type: string;
    name: string;
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          size: file.size,
          type: file.type,
          name: file.name
        });
        URL.revokeObjectURL(img.src);
      };
      
      img.onerror = () => {
        reject(new Error('无法读取图片元数据'));
        URL.revokeObjectURL(img.src);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  // 旋转图片
  static rotateImage(file: File, degrees: number): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const radians = (degrees * Math.PI) / 180;
        
        // 计算旋转后的画布尺寸
        const sin = Math.abs(Math.sin(radians));
        const cos = Math.abs(Math.cos(radians));
        const newWidth = img.width * cos + img.height * sin;
        const newHeight = img.width * sin + img.height * cos;
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // 移动到画布中心并旋转
        ctx?.translate(newWidth / 2, newHeight / 2);
        ctx?.rotate(radians);
        ctx?.drawImage(img, -img.width / 2, -img.height / 2);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const rotatedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(rotatedFile);
            } else {
              reject(new Error('图片旋转失败'));
            }
          },
          file.type,
          0.9
        );
      };
      
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = URL.createObjectURL(file);
    });
  }

  // 裁剪图片
  static cropImage(
    file: File,
    x: number,
    y: number,
    width: number,
    height: number
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, x, y, width, height, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const croppedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(croppedFile);
            } else {
              reject(new Error('图片裁剪失败'));
            }
          },
          file.type,
          0.9
        );
      };
      
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = URL.createObjectURL(file);
    });
  }

  // 格式化文件大小
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // 检查浏览器是否支持WebP
  static supportsWebP(): Promise<boolean> {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }
}

// 导出常用函数
export const {
  compressImage,
  fileToBase64,
  createPreviewUrl,
  revokePreviewUrl,
  validateImageFile,
  getImageMetadata,
  formatFileSize
} = ImageUtils;