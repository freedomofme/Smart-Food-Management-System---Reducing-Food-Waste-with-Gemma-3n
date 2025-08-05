import { AIRecognitionResult, DetectedFood, FoodCategory, FreshnessLevel } from '../types';

// Gemma 3-27b-it AI Service Class - Supports Image Understanding
export class GemmaAIService {
  private static instance: GemmaAIService;
  private apiUrl: string;
  private filesApiUrl: string;
  private isInitialized = false;

  private constructor() {
    // Automatically select API endpoint based on environment
    if (typeof window !== 'undefined') {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Local development environment, use Google AI Studio API - Gemma 3-27b-it supports image understanding
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent';
        this.filesApiUrl = 'https://generativelanguage.googleapis.com/v1beta/files';
      } else {
        // Production environment, use relative path
        this.apiUrl = '/api/gemma';
        this.filesApiUrl = '/api/gemma/files';
      }
    } else {
      // Server-side rendering environment
      this.apiUrl = '/api/gemma';
      this.filesApiUrl = '/api/gemma/files';
    }
  }

  static getInstance(): GemmaAIService {
    if (!GemmaAIService.instance) {
      GemmaAIService.instance = new GemmaAIService();
    }
    return GemmaAIService.instance;
  }

  // Initialize AI model
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('Initializing Gemma 3-27b-it model connection...');
      
      // Test API connection
      await this.testApiConnection();
      
      this.isInitialized = true;
      console.log('Gemma 3-27b-it model connection successful');
    } catch (error) {
      console.error('AI model initialization failed:', error);
      // If API connection fails, still allow using mock data
      this.isInitialized = true;
      console.warn('Using mock data mode');
    }
  }

  // Recognize food in images
  async recognizeFood(imageData: string | File): Promise<AIRecognitionResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = Date.now();

    try {
      // Try using real Gemma 3-27b-it API
      const result = await this.callGemmaAPI(imageData, 'food_recognition');
      const processingTime = Date.now() - startTime;

      if (result && result.foods) {
        return {
          foods: result.foods,
          confidence: result.confidence || 0.85,
          processingTime
        };
      } else {
        // If API call fails, use mock data
        console.warn('API call failed, using mock data');
        const mockResult = await this.mockFoodRecognition(imageData);
        return {
          foods: mockResult,
          confidence: 0.85,
          processingTime
        };
      }
    } catch (error) {
      console.error('Food recognition failed:', error);
      // Fallback to mock data
      const mockResult = await this.mockFoodRecognition(imageData);
      const processingTime = Date.now() - startTime;
      return {
        foods: mockResult,
        confidence: 0.85,
        processingTime
      };
    }
  }

  // Predict food shelf life
  async predictShelfLife(foodName: string, category: FoodCategory, freshness: FreshnessLevel): Promise<number> {
    // Predict shelf life based on food type and freshness
    const baseShelfLife = this.getBaseShelfLife(category);
    const freshnessMultiplier = this.getFreshnessMultiplier(freshness);
    
    return Math.round(baseShelfLife * freshnessMultiplier);
  }

  // Generate recipe recommendations
  async generateRecipeRecommendations(ingredients: string[]): Promise<string[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Try using real Gemma 3-27b-it API
      const result = await this.callGemmaAPI(ingredients, 'recipe_generation');
      
      if (result && result.recipes && Array.isArray(result.recipes)) {
        return result.recipes;
      } else {
        // If API call fails, use mock data
        console.warn('API call failed, using mock recipe generation');
        return this.mockRecipeGeneration(ingredients);
      }
    } catch (error) {
      console.error('Recipe recommendation generation failed:', error);
      // Fallback to mock data
      return this.mockRecipeGeneration(ingredients);
    }
  }

  // Call Gemma 3-27b-it API
  private async callGemmaAPI(data: any, task: string): Promise<any> {
    try {
      const prompt = this.buildPrompt(data, task);
      
      // Select different request headers and URL based on environment
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      let requestUrl = this.apiUrl;
      let requestBody: any;
      
      // If local environment, directly call Google AI Studio API
      if (this.apiUrl.includes('generativelanguage.googleapis.com')) {
        const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY;
        if (googleApiKey) {
          requestUrl = `${this.apiUrl}?key=${googleApiKey}`;
        }
        
        // Build request content
        const parts: any[] = [{ text: prompt }];
        
        // If it's image recognition task with image data, upload file first then add file reference
        if (task === 'food_recognition' && data) {
          console.log('Starting to process image data...');
          
          let imageAdded = false;
          
          // First try file upload method
          try {
            const uploadedFile = await this.uploadFile(data);
            if (uploadedFile && uploadedFile.uri) {
              console.log('Using file upload method:', uploadedFile);
              parts.push({
                fileData: {
                  mimeType: uploadedFile.mimeType,
                  fileUri: uploadedFile.uri
                }
              });
              imageAdded = true;
            } else {
              console.warn('File upload returned empty result');
            }
          } catch (uploadError) {
            console.error('File upload failed:', uploadError);
          }
          
          // If file upload fails, fallback to inline data method
          if (!imageAdded) {
            console.log('Falling back to inline data method...');
            try {
              const imageBase64 = await this.convertToBase64(data);
              if (imageBase64) {
                const mimeType = this.getMimeType(data);
                console.log('Using inline data method:', { mimeType, dataLength: imageBase64.length });
                parts.push({
                  inlineData: {
                    mimeType: mimeType,
                    data: imageBase64
                  }
                });
                imageAdded = true;
              } else {
                console.error('base64 conversion failed');
              }
            } catch (inlineError) {
              console.error('inline data processing failed:', inlineError);
            }
          }
          
          if (!imageAdded) {
            console.error('Image data processing completely failed, will only send text prompt');
          } else {
            console.log('Image data added successfully, parts count:', parts.length);
          }
        }
        
        // Google AI Studio API format
        requestBody = {
          contents: [{
            parts: parts
          }],
          generationConfig: {
            maxOutputTokens: 2000,
            temperature: 0.7
          }
        };
      } else {
        // Vercel 代理格式（使用Google AI Studio API格式）
        const parts: any[] = [{ text: prompt }];
        
        // If it's image recognition task with image data, add image data
        if (task === 'food_recognition' && data) {
          console.log('Processing image data for Vercel environment...');
          
          try {
            const imageBase64 = await this.convertToBase64(data);
            if (imageBase64) {
              const mimeType = this.getMimeType(data);
              console.log('Adding inline data for Vercel:', { mimeType, dataLength: imageBase64.length });
              parts.push({
                inlineData: {
                  mimeType: mimeType,
                  data: imageBase64
                }
              });
            }
          } catch (error) {
            console.error('Image processing failed in Vercel environment:', error);
          }
        }
        
        requestBody = {
          contents: [{
            parts: parts
          }],
          generationConfig: {
            maxOutputTokens: 2000,
            temperature: 0.7
          }
        };
      }
      
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error details:', errorText);
        throw new Error(`API call failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return this.parseGemmaResponse(result, task);
    } catch (error) {
      console.error('Gemma API call failed:', error);
      console.error('Request details:', { apiUrl: this.apiUrl, task, hasImageData: !!data });
      throw error;
    }
  }

  // Build prompts
  private buildPrompt(data: any, task: string): string {
    switch (task) {
      case 'food_recognition':
        if (data && (typeof data === 'string' || data instanceof File)) {
          // Prompt when image data is available
          return `As a food recognition expert, please carefully analyze the food in this image. Identify all visible food types in the image, assess their freshness, and estimate shelf life. Please return results strictly in the following JSON format: {"foods": [{"name": "specific food name", "category": "category", "confidence": 0.9, "freshness": "fresh", "estimatedShelfLife": 7}]}.

Categories include: fruits, vegetables, meat, dairy, grains, beverages, snacks, condiments, frozen, canned, bakery, other.

Freshness levels: fresh, good, fair, poor.

Please return only JSON format results without any other text explanations.`;
        } else {
          // Prompt when no image data is available
          return `As a food recognition expert, please identify possible food types based on user description. Please return JSON format: {"foods": [{"name": "food name", "category": "category", "confidence": 0.9, "freshness": "fresh", "estimatedShelfLife": 7}]}. Common foods include: apple, banana, carrot, tomato, milk, egg, bread, etc.`;
        }
      case 'recipe_generation':
        const cuisineTypes = ['Western', 'Eastern', 'Mediterranean', 'Asian', 'European'];
        const randomCuisine = cuisineTypes[Math.floor(Math.random() * cuisineTypes.length)];
        return `As a culinary expert, based on the following ingredients: ${data.join(', ')}, please recommend 5 simple and easy-to-make recipes with a mix of ${randomCuisine} and international cuisine preferences. Include both traditional and fusion dishes. Return JSON format: {"recipes": ["recipe1", "recipe2", "recipe3", "recipe4", "recipe5"]}`;
      default:
        return '';
    }
  }

  // Parse Gemma response
  private parseGemmaResponse(response: any, task: string): any {
    try {
      let text = '';
      
      // Google AI Studio API 响应格式
      if (response.candidates && response.candidates.length > 0) {
        const candidate = response.candidates[0];
        
        // Check if truncated due to MAX_TOKENS
        if (candidate.finishReason === 'MAX_TOKENS') {
          console.warn('Response was truncated due to maximum token limit');
        }
        
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          text = candidate.content.parts[0].text || '';
        } else if (candidate.content && candidate.content.parts) {
          // Handle empty parts array
          console.warn('Response content is empty, possibly due to token limit or other reasons');
        }
      }
      // Hugging Face API response format (for Vercel proxy)
      else if (Array.isArray(response) && response.length > 0) {
        text = response[0].generated_text || response[0].text || '';
      }
      
      if (text) {
        console.log('Raw response text:', text);
        console.log('Response token usage:', response.usageMetadata);
        
        // Clean text, remove markdown code block markers
        let cleanText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        
        // Try multiple JSON extraction methods
        let jsonStr = '';
        
        // Method 1: Find complete JSON object (supports nesting)
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonStr = jsonMatch[0];
        } else {
          // Method 2: Find JSON array
          const arrayMatch = cleanText.match(/\[[\s\S]*\]/);
          if (arrayMatch) {
            jsonStr = arrayMatch[0];
          }
        }
        
        if (jsonStr) {
          // Clean common issues in JSON string
          jsonStr = jsonStr
            .replace(/,\s*}/g, '}')  // Remove extra commas at end of objects
            .replace(/,\s*]/g, ']')  // Remove extra commas at end of arrays
            .replace(/\n/g, ' ')     // Replace newlines
            .replace(/\t/g, ' ')     // Replace tabs
            .replace(/\s+/g, ' ')    // Merge multiple spaces
            .trim();
          
          console.log('Cleaned JSON string:', jsonStr);
          
          try {
            const parsed = JSON.parse(jsonStr);
            console.log('Successfully parsed JSON:', parsed);
            
            // Special handling for recipe generation task
            if (task === 'recipe_generation' && parsed.recipes) {
              // Check if recipes is an array of objects with name property
              if (Array.isArray(parsed.recipes) && parsed.recipes.length > 0) {
                // If recipes contain objects with name property, extract the names
                if (typeof parsed.recipes[0] === 'object' && parsed.recipes[0].name) {
                  const recipeNames = parsed.recipes
                    .map(recipe => recipe.name)
                    .filter(name => typeof name === 'string' && name.trim().length > 0);
                  console.log('Extracted recipe names:', recipeNames);
                  return { recipes: recipeNames };
                }
                // If recipes is already an array of strings, return as is
                else if (typeof parsed.recipes[0] === 'string') {
                  return parsed;
                }
              }
            }
            
            return parsed;
          } catch (parseError) {
            console.error('JSON parsing failed:', parseError);
            console.error('Problematic JSON string:', jsonStr);
            
            // Try to fix common JSON format issues
            try {
              // Fix single quote issues
              const fixedJson = jsonStr.replace(/'/g, '"');
              const fixedParsed = JSON.parse(fixedJson);
              
              // Apply same recipe handling logic to fixed JSON
              if (task === 'recipe_generation' && fixedParsed.recipes) {
                if (Array.isArray(fixedParsed.recipes) && fixedParsed.recipes.length > 0) {
                  if (typeof fixedParsed.recipes[0] === 'object' && fixedParsed.recipes[0].name) {
                    const recipeNames = fixedParsed.recipes
                      .map(recipe => recipe.name)
                      .filter(name => typeof name === 'string' && name.trim().length > 0);
                    console.log('Extracted recipe names from fixed JSON:', recipeNames);
                    return { recipes: recipeNames };
                  }
                }
              }
              
              return fixedParsed;
            } catch (fixError) {
              console.error('Still failed to parse after fixing:', fixError);
            }
          }
        }
      }
      
      // If parsing fails, return default structure
      console.warn('Unable to parse response, returning default structure');
      if (task === 'food_recognition') {
        return {
          foods: [{
            name: 'Unidentified Food',
            category: 'other',
            confidence: 0.5,
            freshness: 'good',
            estimatedShelfLife: 7
          }]
        };
      } else if (task === 'recipe_generation') {
        return {
          recipes: ['Simple Stir Fry', 'Steamed Egg Custard', 'Vegetable Soup', 'Fruit Salad', 'Nutritious Porridge']
        };
      }
      
      return null;
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      return null;
    }
  }

  // Test API connection
  private async testApiConnection(): Promise<void> {
    try {
      // Select different request headers and URL based on environment
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      let requestUrl = this.apiUrl;
      let requestBody: any;
      
      // If local environment, directly call Google AI Studio API
      if (this.apiUrl.includes('generativelanguage.googleapis.com')) {
        const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY;
        if (googleApiKey) {
          requestUrl = `${this.apiUrl}?key=${googleApiKey}`;
        }
        
        // Google AI Studio API format
        requestBody = {
          contents: [{
            parts: [{
              text: "Test connection"
            }]
          }],
          generationConfig: {
            maxOutputTokens: 50,
            temperature: 0.1
          }
        };
      } else {
        // Vercel proxy format
        requestBody = {
          inputs: "Test connection",
          parameters: {
            max_new_tokens: 10,
            temperature: 0.1
          }
        };
      }
      
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`API test failed: ${response.status}`);
      }
    } catch (error) {
      console.error('API connection test failed:', error);
      throw error;
    }
  }

  // Mock food recognition (fallback solution)
  private async mockFoodRecognition(imageData: string | File): Promise<DetectedFood[]> {
    // Simulate AI recognition delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate recognition results
    const mockFoods: DetectedFood[] = [
      {
        name: 'Apple',
        category: FoodCategory.FRUITS,
        confidence: 0.92,
        freshness: FreshnessLevel.FRESH,
        estimatedShelfLife: 14,
        boundingBox: { x: 100, y: 50, width: 150, height: 120 }
      },
      {
        name: 'Carrot',
        category: FoodCategory.VEGETABLES,
        confidence: 0.88,
        freshness: FreshnessLevel.GOOD,
        estimatedShelfLife: 7,
        boundingBox: { x: 300, y: 80, width: 100, height: 200 }
      },
      {
        name: 'Milk',
        category: FoodCategory.DAIRY,
        confidence: 0.95,
        freshness: FreshnessLevel.FRESH,
        estimatedShelfLife: 5,
        boundingBox: { x: 450, y: 60, width: 80, height: 180 }
      }
    ];

    return mockFoods;
  }

  // Mock recipe generation
  private mockRecipeGeneration(ingredients: string[]): string[] {
    const westernTemplates = [
      '{0} Salad',
      'Grilled {0}',
      '{0} Pasta',
      '{0} Sandwich',
      '{0} Soup',
      'Roasted {0}'
    ];
    
    const easternTemplates = [
      'Stir-fried {0}',
      '{0} Fried Rice',
      'Steamed {0}',
      '{0} Hot Pot',
      '{0} Noodles',
      '{0} Curry'
    ];

    const recipes: string[] = [];
    
    ingredients.forEach(ingredient => {
      // Randomly choose between Western and Eastern cuisine
      const useWestern = Math.random() > 0.5;
      const templates = useWestern ? westernTemplates : easternTemplates;
      const template = templates[Math.floor(Math.random() * templates.length)];
      recipes.push(template.replace('{0}', ingredient));
    });

    return recipes.slice(0, 5); // Return at most 5 recommendations
  }

  // Get base shelf life (days)
  private getBaseShelfLife(category: FoodCategory): number {
    const shelfLifeMap: Record<FoodCategory, number> = {
      [FoodCategory.VEGETABLES]: 7,
      [FoodCategory.FRUITS]: 10,
      [FoodCategory.MEAT]: 3,
      [FoodCategory.DAIRY]: 7,
      [FoodCategory.GRAINS]: 365,
      [FoodCategory.BEVERAGES]: 30,
      [FoodCategory.SNACKS]: 30,
      [FoodCategory.CONDIMENTS]: 180,
      [FoodCategory.FROZEN]: 90,
      [FoodCategory.CANNED]: 365,
      [FoodCategory.BAKERY]: 5,
      [FoodCategory.OTHER]: 14
    };

    return shelfLifeMap[category] || 7;
  }

  // Get freshness multiplier
  private getFreshnessMultiplier(freshness: FreshnessLevel): number {
    const multiplierMap: Record<FreshnessLevel, number> = {
      [FreshnessLevel.FRESH]: 1.0,
      [FreshnessLevel.GOOD]: 0.7,
      [FreshnessLevel.FAIR]: 0.4,
      [FreshnessLevel.POOR]: 0.1
    };

    return multiplierMap[freshness] || 0.5;
  }

  // Check if model is available
  isModelReady(): boolean {
    return this.isInitialized;
  }

  // Upload file to Google AI Studio
  private async uploadFile(imageData: string | File): Promise<{ uri: string; mimeType: string } | null> {
    try {
      const googleApiKey = import.meta.env.VITE_GOOGLE_API_KEY;
      if (!googleApiKey) {
        throw new Error('Google API Key not configured');
      }

      console.log('Starting file upload to Google AI Studio...');

      // Prepare file data
      let fileBlob: Blob;
      let mimeType: string;
      let fileName: string;
      
      if (imageData instanceof File) {
        fileBlob = imageData;
        mimeType = imageData.type || 'image/jpeg';
        fileName = imageData.name || 'image.jpg';
        console.log('Processing File object:', { name: fileName, type: mimeType, size: fileBlob.size });
      } else if (typeof imageData === 'string') {
        // If it's a base64 string, convert to Blob
        const base64Data = imageData.startsWith('data:') ? imageData.split(',')[1] : imageData;
        const mimeMatch = imageData.match(/data:([^;]+)/);
        mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        fileName = 'image.' + (mimeType.split('/')[1] || 'jpg');
        
        console.log('Processing base64 string:', { mimeType, dataLength: base64Data.length });
        
        try {
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          fileBlob = new Blob([byteArray], { type: mimeType });
          console.log('base64 conversion successful:', { blobSize: fileBlob.size, mimeType });
        } catch (base64Error) {
          console.error('base64 decoding failed:', base64Error);
          throw new Error('base64 data format error');
        }
      } else {
        throw new Error('Unsupported image data format');
      }

      // Validate file size
      if (fileBlob.size === 0) {
        throw new Error('File size is 0, cannot upload');
      }
      
      if (fileBlob.size > 20 * 1024 * 1024) { // 20MB limit
        throw new Error('File size exceeds 20MB limit');
      }

      // Create FormData - use correct format
      const formData = new FormData();
      formData.append('file', fileBlob, fileName);
      
      console.log('Preparing file upload:', { fileName, mimeType, size: fileBlob.size });
      
      // Upload file - remove custom headers that might cause issues
      const uploadUrl = `${this.filesApiUrl}?key=${googleApiKey}`;
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
        // Don't set Content-Type header, let browser automatically set multipart/form-data boundary
      });

      console.log('Upload response status:', uploadResponse.status, uploadResponse.statusText);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('File upload failed:', {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          errorText
        });
        throw new Error(`File upload failed: ${uploadResponse.status} - ${errorText}`);
      }

      const uploadResult = await uploadResponse.json();
      console.log('File upload successful:', uploadResult);
      
      // Check response format
      if (!uploadResult || (!uploadResult.file && !uploadResult.uri)) {
        console.error('Upload response format abnormal:', uploadResult);
        throw new Error('Upload response format abnormal');
      }
      
      const fileUri = uploadResult.file?.uri || uploadResult.uri;
      const fileMimeType = uploadResult.file?.mimeType || uploadResult.mimeType || mimeType;
      
      if (!fileUri) {
        throw new Error('Failed to get file URI');
      }
      
      console.log('File upload completed:', { uri: fileUri, mimeType: fileMimeType });
      
      return {
        uri: fileUri,
        mimeType: fileMimeType
      };
    } catch (error) {
      console.error('Error occurred during file upload:', error);
      return null;
    }
  }

  // Convert image to base64 format
  private async convertToBase64(imageData: string | File): Promise<string | null> {
    try {
      if (typeof imageData === 'string') {
        // If already a base64 string, extract data part
        if (imageData.startsWith('data:')) {
          return imageData.split(',')[1];
        }
        return imageData;
      } else if (imageData instanceof File) {
        // If it's a File object, convert to base64
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Remove data:image/xxx;base64, prefix
            const base64Data = result.split(',')[1];
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(imageData);
        });
      }
      return null;
    } catch (error) {
      console.error('Image conversion to base64 failed:', error);
      return null;
    }
  }

  // Get MIME type
  private getMimeType(imageData: string | File): string {
    if (typeof imageData === 'string') {
      if (imageData.startsWith('data:')) {
        const mimeMatch = imageData.match(/data:([^;]+)/);
        return mimeMatch ? mimeMatch[1] : 'image/jpeg';
      }
      return 'image/jpeg';
    } else if (imageData instanceof File) {
      return imageData.type || 'image/jpeg';
    }
    return 'image/jpeg';
  }

  // Get model information
  getModelInfo(): { name: string; version: string; capabilities: string[] } {
    return {
      name: 'Gemma 3-27b-it',
      version: '3.0.0',
      capabilities: [
        'Image Understanding',
        'Multimodal Processing',
        'Food Recognition',
        'Intelligent Text Generation',
        'Food Classification Suggestions',
        'Freshness Assessment',
        'Shelf Life Prediction',
        'Recipe Recommendations'
      ]
    };
  }
}

// Export singleton instance
export const gemmaAI = GemmaAIService.getInstance();

// Food recognition utility function
export const recognizeFoodFromImage = async (imageFile: File): Promise<AIRecognitionResult> => {
  return await gemmaAI.recognizeFood(imageFile);
};

// Shelf life prediction utility function
export const predictFoodShelfLife = async (
  foodName: string, 
  category: FoodCategory, 
  freshness: FreshnessLevel
): Promise<number> => {
  return await gemmaAI.predictShelfLife(foodName, category, freshness);
};

// Recipe recommendation utility function
export const getRecipeRecommendations = async (ingredients: string[]): Promise<string[]> => {
  return await gemmaAI.generateRecipeRecommendations(ingredients);
};