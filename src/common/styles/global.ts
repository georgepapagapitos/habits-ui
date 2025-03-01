import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body, #root {
    height: 100%;
    width: 100%;
    position: relative;
    overflow: hidden; /* Prevent default body scrolling */
  }

  body {
    font-family: ${({ theme }) => theme.typography.fontFamily};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    
    /* Fix for iOS Safari to prevent bouncing/elastic scrolling */
    position: fixed;
    width: 100%;
    height: 100%;
    
    /* Fix iOS overscroll behavior */
    overscroll-behavior-y: none;
    -webkit-overflow-scrolling: touch;
    
    /* Prevent pull-to-refresh on mobile browsers */
    touch-action: pan-x pan-y;
  }

  /* Ensure app root takes full height */
  #root {
    display: flex;
    flex-direction: column;
  }

  /* Remove blue highlight when tapping on mobile */
  button, a {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  /* Improve scrolling in Content area */
  main {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
`;

export default GlobalStyle;