import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  /* CSS Reset/Normalize */
  html, body, div, span, applet, object, iframe,
  h1, h2, h3, h4, h5, h6, p, blockquote, pre,
  a, abbr, acronym, address, big, cite, code,
  del, dfn, em, img, ins, kbd, q, s, samp,
  small, strike, strong, sub, sup, tt, var,
  b, u, i, center,
  dl, dt, dd, ol, ul, li,
  fieldset, form, label, legend,
  table, caption, tbody, tfoot, thead, tr, th, td,
  article, aside, canvas, details, embed, 
  figure, figcaption, footer, header, hgroup, 
  menu, nav, output, ruby, section, summary,
  time, mark, audio, video {
    margin: 0;
    padding: 0;
    border: 0;
    font-size: 100%;
    font: inherit;
    vertical-align: baseline;
  }
  
  /* Box sizing */
  * {
    box-sizing: border-box;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
  }
  
  /* HTML5 display-role reset for older browsers */
  article, aside, details, figcaption, figure, 
  footer, header, hgroup, menu, nav, section {
    display: block;
  }
  
  ol, ul {
    list-style: none;
  }
  
  blockquote, q {
    quotes: none;
  }
  
  blockquote:before, blockquote:after,
  q:before, q:after {
    content: '';
    content: none;
  }
  
  table {
    border-collapse: collapse;
    border-spacing: 0;
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
    
    /* iOS fixes */
    position: fixed;
    width: 100%;
    height: 100%;
    
    /* Fix iOS overscroll behavior */
    overscroll-behavior: none;
    -webkit-overscroll-behavior: none;
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
    flex: 1;
  }
  
  /* Fix for iOS Safari gaps in flexbox/grid layouts */
  img {
    max-width: 100%;
    display: block;
  }
  
  /* Fix for iOS image rendering */
  @supports (-webkit-touch-callout: none) {
    img {
      /* Prevent weird image rendering issues on iOS */
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
    }
    
    /* Prevent iOS grid and flexbox gaps */
    div {
      transform: translateZ(0);
      -webkit-transform: translateZ(0);
    }
    
    /* Fix for iOS Safari height calculation issues */
    html {
      height: -webkit-fill-available;
    }
    
    body {
      min-height: -webkit-fill-available;
      height: -webkit-fill-available;
    }
  }
`;

export default GlobalStyle;
