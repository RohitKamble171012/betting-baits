//src/lib/auth.ts
export const getValidToken = () => {
    try {
      let token = localStorage.getItem('token');
      if (!token) return null;
  
      // Remove quotes if present
      token = token.replace(/^"(.*)"$/, '$1');
      
      // Basic JWT format validation
      if (!/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/.test(token)) {
        localStorage.removeItem('token');
        return null;
      }
      
      return token;
    } catch (error) {
      console.error('Token handling error:', error);
      return null;
    }
  };