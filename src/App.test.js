import { screen } from '@testing-library/react';
import {render} from '@testing-library/react';
import {act} from "react";
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText('Activate Account');
  expect(linkElement).toBeInTheDocument();
});
