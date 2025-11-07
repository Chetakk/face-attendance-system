import React from 'react';
type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: any };
export default class ErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(err:any){ return { hasError: true, error: err }; }
  componentDidCatch(err:any, info:any){ console.error('ErrorBoundary caught', err, info); }
  render(){
    if (this.state.hasError) {
      return (
        <div style={{padding:20,background:'#fee',color:'#400',borderRadius:8}}>
          <h3>Component failed to render</h3>
          <pre style={{whiteSpace:'pre-wrap'}}>{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
