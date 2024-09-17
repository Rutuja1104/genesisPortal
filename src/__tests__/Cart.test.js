import { render, screen } from '@testing-library/react'
import Cart from "../pages/Cart"

test("Example 1", () => {
    render(<Cart />);

    const element = screen.getByText(/Cart/i);

    expect(element).toBeInTheDocument();
})