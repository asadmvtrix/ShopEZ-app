import { Component } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import PageContainer from "./PageContainer";

export default class ErrorBoundary extends Component {
  state = { crashed: false, message: null };

  static getDerivedStateFromError(error) {
    return {
      crashed: true,
      message: error?.message ? String(error.message) : null,
    };
  }

  componentDidCatch(error) {
    if (import.meta.env.DEV) {
      console.error("[ShopEZ]", error);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.crashed) {
      this.setState({ crashed: false, message: null });
    }
  }

  handleRetry = () => {
    this.setState({ crashed: false, message: null });
  };

  render() {
    if (!this.state.crashed) {
      return this.props.children;
    }

    return (
      <PageContainer className="max-w-xl py-16 text-center md:py-24">
        <p className="font-mono text-4xl text-muted-foreground/50 md:text-5xl">Oops</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Something went wrong
        </h1>
        <p className="mt-1.5 mb-2 text-sm text-muted-foreground">
          ShopEZ hit an unexpected error. You can try again, or head back home.
        </p>
        {import.meta.env.DEV && this.state.message ? (
          <p className="mb-6 font-mono text-xs break-words text-destructive">
            {this.state.message}
          </p>
        ) : (
          <div className="mb-6" />
        )}
        <div className="flex flex-col items-center justify-center gap-1.5 sm:flex-row">
          <Button onClick={this.handleRetry}>Try again</Button>
          <RouterLink
            to="/"
            onClick={this.handleRetry}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Back to home
          </RouterLink>
        </div>
        <div className="mt-6">
          <Button size="sm" variant="ghost" onClick={() => window.location.assign("/")}>
            Reload the app
          </Button>
        </div>
      </PageContainer>
    );
  }
}
