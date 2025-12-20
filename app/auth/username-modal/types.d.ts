export type UsernameModalProps = {
  visible: boolean;
  onSubmit: (username: string) => void;
  isLoading?: boolean;
  errorMessage?: string;
};