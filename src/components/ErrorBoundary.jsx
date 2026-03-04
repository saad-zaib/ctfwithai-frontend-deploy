import React from 'react';

class ErrorBoundary extends React.Component {
  state = { error: null };
  
  componentDidCatch(error, info) {
    console.log('CAUGHT ERROR:', error.message, info.componentStack);
  }
  
  static getDerivedStateFromError(error) {
    return { error };
  }
  
  render() {
    if (this.state.error) {
      return (
        <div style={{ background: '#1a0000', color: '#ff4444', padding: 40, fontFamily: 'monospace' }}>
          <h2>Render Crash:</h2>
          <pre>{this.state.error.message}</pre>
          <pre>{this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
