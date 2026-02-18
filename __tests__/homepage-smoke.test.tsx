import { render, screen } from '@testing-library/react';

import HomePage from '@/app/page';

describe('HomePage', () => {
  it('renders the baseline placeholder panels', () => {
    render(<HomePage />);

    expect(screen.getByRole('heading', { name: 'Repository picker' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Preview tabs' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Chat' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Action bar' })).toBeInTheDocument();
  });
});
