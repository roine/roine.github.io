import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import Button from '../';

storiesOf('Button', module)
  .add('with text', () => (
    <React.Fragment>
    <Button onClick={action('clicked')}>Hello Button</Button>
    <Button onClick={action('clicked')}>Hello Button</Button>
    </React.Fragment>
  ))
  .add('with some emoji', () => (
    <Button onClick={action('clicked')}><span role="img" aria-label="so cool">😀 😎 👍 💯</span></Button>
  ))
  .add('with style', () => (
    <Button backgroundcolor={'red'} color={'blue'} width={400}>Red button</Button>
  ));
