import { screen } from "../libs/utility/test-utility/test-utils"

test("Example 1", () => {

    const element = screen.getByText(/class to make any table/i);

    expect(element).toBeInTheDocument();
})