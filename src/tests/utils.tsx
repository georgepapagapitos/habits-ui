import { render, RenderOptions } from "@testing-library/react";
import React, { ReactElement } from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import theme from "../common/theme";

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  route?: string;
}

export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const { route = "/", ...renderOptions } = options;

  window.history.pushState({}, "Test page", route);

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <BrowserRouter>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </BrowserRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
