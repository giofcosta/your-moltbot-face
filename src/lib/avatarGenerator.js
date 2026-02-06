/**
 * Avatar Generation API
 * Uses Pollinations.ai (free, no API key required)
 * With retry logic and fallback for reliability
 */

const POLLINATIONS_URL = 'https://image.pollinations.ai/prompt/';

// Fallback placeholder when all generation fails
const PLACEHOLDER_URL = 'https://api.dicebear.com/7.x/shapes/svg';

/**
 * Delay helper
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check if an image URL is valid by making a HEAD request
 */
async function validateImageUrl(url, timeout = 15000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    // Check if response is an image
    const contentType = response.headers.get('content-type');
    return response.ok && contentType?.startsWith('image/');
  } catch (error) {
    console.warn('Image validation failed:', error.message);
    return false;
  }
}

/**
 * Build Pollinations URL - simplified for reliability
 */
function buildImageUrl(prompt, seed = null) {
  const encodedPrompt = encodeURIComponent(prompt);
  // Use minimal parameters for maximum reliability
  const seedParam = seed ? `?seed=${seed}` : '';
  return `${POLLINATIONS_URL}${encodedPrompt}${seedParam}`;
}

/**
 * Build DiceBear placeholder URL
 */
function buildPlaceholderUrl(seed) {
  return `${PLACEHOLDER_URL}?seed=${seed}&backgroundColor=1e3a5f,0f172a&size=512`;
}

export async function generateAvatar(prompt, options = {}) {
  const seed = options.seed || Math.floor(Math.random() * 1000000);
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds between retries
  
  // Try Pollinations with retries
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const imageUrl = buildImageUrl(prompt, seed);
    
    console.log(`Attempt ${attempt}/${maxRetries}: ${imageUrl}`);
    
    const isValid = await validateImageUrl(imageUrl);
    
    if (isValid) {
      console.log(`Success on attempt ${attempt}`);
      return {
        success: true,
        url: imageUrl,
        seed,
        prompt,
        source: 'pollinations',
      };
    }
    
    console.warn(`Attempt ${attempt} failed`);
    
    // Wait before retry (except on last attempt)
    if (attempt < maxRetries) {
      console.log(`Waiting ${retryDelay}ms before retry...`);
      await delay(retryDelay);
    }
  }
  
  // All Pollinations attempts failed - use placeholder
  console.warn('All Pollinations attempts failed, using placeholder');
  const placeholderUrl = buildPlaceholderUrl(seed);
  
  return {
    success: true,
    url: placeholderUrl,
    seed,
    prompt,
    source: 'placeholder',
    warning: 'Image generation service is temporarily unavailable. Using placeholder.',
  };
}

// Default prompts for Kratos avatar
export const DEFAULT_PROMPTS = {
  kratos: 'A stylized digital avatar for an AI coding assistant named Kratos, geometric angular face with sharp diamond-shaped eyes glowing gold, blue electric blue color scheme with gold accents, lightning bolt symbol on forehead, dark navy blue background with circuit patterns, profile picture style, high quality digital art, powerful but friendly expression, tech aesthetic, clean lines',
  
  kratosMinimal: 'Minimalist geometric avatar, angular face silhouette, blue and gold colors, lightning bolt, dark background, vector art style',
  
  kratosCyberpunk: 'Cyberpunk style avatar for AI assistant Kratos, neon blue and gold, geometric angular face, glowing eyes, lightning bolt, dark futuristic background, digital art, high tech',
  
  kratosAbstract: 'Abstract geometric representation of Kratos AI, angular shapes forming a face, blue electric arcs, gold lightning, dark void background, mystical tech aesthetic',
};

export async function generateKratosAvatar(style = 'kratos', options = {}) {
  const prompt = DEFAULT_PROMPTS[style] || DEFAULT_PROMPTS.kratos;
  return generateAvatar(prompt, options);
}
