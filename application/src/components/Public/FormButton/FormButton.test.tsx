import React from 'react';
import { render, screen } from '@testing-library/react';
import FormButton from './FormButton';
import userEvent from '@testing-library/user-event';

describe('FormButton', () => {
  it('renders the button with given text', () => {
    render(<FormButton>Submit</FormButton>);
    const button = screen.getByRole('button', { name: /submit/i });
    expect(button).toBeInTheDocument();
  });

  it('has type="submit"', () => {
    render(<FormButton>Submit</FormButton>);
    const button = screen.getByRole('button', { name: /submit/i });
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('has the expected styles and props', () => {
    render(<FormButton>Send</FormButton>);
    const button = screen.getByRole('button', { name: /send/i });
    expect(button).toHaveClass('MuiButton-contained');
    expect(button).toHaveStyle({ textTransform: 'none' });
  });

  it('calls onClick handler when provided and clicked', async () => {
    const handleClick = jest.fn();
    render(
      <FormButton>
        <span onClick={handleClick}>Click me</span>
      </FormButton>
    );
    await userEvent.click(screen.getByText(/click me/i));
    expect(handleClick).toHaveBeenCalled();
  });
});
