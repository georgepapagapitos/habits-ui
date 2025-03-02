import { describe, test, expect } from "vitest";
import { screen } from "@testing-library/react";
import { BottomNav } from "./BottomNav";
import { renderWithProviders } from "../../../tests/utils";

describe("BottomNav", () => {
  test("renders navigation items", () => {
    renderWithProviders(<BottomNav />);

    // Check that all navigation items are rendered
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("Weekly")).toBeInTheDocument();
    expect(screen.getByText("Stats")).toBeInTheDocument();
  });
});
