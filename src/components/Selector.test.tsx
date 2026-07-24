import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";

import { Selector } from "./Selector";

afterEach(cleanup);

describe("Selector", () => {
  it("round-trips number options through the DOM's string layer", () => {
    const received: number[] = [];
    render(
      <Selector
        name="weeks"
        options={[6, 7, 8]}
        value={7}
        handleChange={(val) => received.push(val)}
      />,
    );

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("1"); // index of 7

    fireEvent.change(select, { target: { value: "2" } });
    expect(received).toEqual([8]);
    expect(typeof received[0]).toBe("number");
  });

  it("round-trips string options", () => {
    const received: string[] = [];
    render(
      <Selector
        name="direction"
        options={["gain", "lose"]}
        value={"lose"}
        handleChange={(val) => received.push(val)}
      />,
    );

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("1");

    fireEvent.change(select, { target: { value: "0" } });
    expect(received).toEqual(["gain"]);
  });

  it("displays the option text, not the index", () => {
    render(
      <Selector
        name="weeks"
        options={[6, 7, 8]}
        value={6}
        handleChange={() => {}}
      />,
    );

    const labels = screen
      .getAllByRole("option")
      .map((option) => option.textContent);
    expect(labels).toEqual(["6", "7", "8"]);
  });

  it("falls back to the first option when value is not among options", () => {
    // Shouldn't happen (state updates keep value within options), but the
    // select's spec-default behavior — show the first option — is sane.
    render(
      <Selector
        name="weeks"
        options={[6, 7, 8]}
        value={99}
        handleChange={() => {}}
      />,
    );

    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("0");
  });
});
