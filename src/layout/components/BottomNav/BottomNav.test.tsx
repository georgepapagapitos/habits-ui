import { screen } from "@testing-library/react";
import { renderWithProviders } from "@tests/utils";
import { describe, expect, test } from "vitest";
import { BottomNav } from "./BottomNav";

describe("BottomNav", () => {
  test("renders navigation items", () => {
    renderWithProviders(<BottomNav />);

    // Check that all navigation items are rendered
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("Weekly")).toBeInTheDocument();
    expect(screen.getByText("Stats")).toBeInTheDocument();
  });
});
