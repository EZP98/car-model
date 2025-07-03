// Environment configuration
export const config = {
  // EmailJS configuration
  emailjs: {
    serviceId: process.env.REACT_APP_EMAILJS_SERVICE_ID || '',
    templateId: process.env.REACT_APP_EMAILJS_TEMPLATE_ID || '',
    publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY || '',
  },
  
  // Site configuration
  site: {
    url: process.env.REACT_APP_SITE_URL || 'http://localhost:3000',
    title: 'Artist Portfolio',
    description: 'Creative Visual Arts Portfolio',
  },
  
  // Social media links
  social: {
    instagram: 'https://instagram.com/yourusername',
    twitter: 'https://twitter.com/yourusername',
    facebook: 'https://facebook.com/yourusername',
    linkedin: 'https://linkedin.com/in/yourusername',
  },
  
  // Contact information
  contact: {
    email: 'artist@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Art Street, Creative City, CC 12345',
  },
};

export default config; 