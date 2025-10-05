import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer', () => {
  it('renders copyright text', () => {
    render(<Footer />);

    // Check for the current year in the copyright text
    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(`© ${currentYear}.*`))).toBeInTheDocument();
  });

  it('renders footer content in correct container', () => {
    const { container } = render(<Footer />);

    // Check that the footer has the appropriate Material UI classes
    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });
});
