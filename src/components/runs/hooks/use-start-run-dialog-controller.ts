import { useCallback, useMemo, useState } from "react";

export function useStartRunDialogController(initialOpen = false) {
  const [open, setOpen] = useState(initialOpen);
  const [nonce, setNonce] = useState(0);

  const openDialog = useCallback(() => {
    setNonce((value) => value + 1);
    setOpen(true);
  }, []);

  return useMemo(
    () => ({ nonce, open, openDialog, setOpen }),
    [nonce, open, openDialog]
  );
}
