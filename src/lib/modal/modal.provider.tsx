import { useContext, useState, createContext, useEffect } from "react";
import { createPortal } from "react-dom";

type ModalRenderer = (props: { close: () => void }) => React.ReactNode;

interface ShowModalOptions {
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
}

interface ModalState {
  renderer: ModalRenderer;
  options: ShowModalOptions;
}

interface ModalContextType {
  showModal(renderer: ModalRenderer, options?: ShowModalOptions): void;
  closeModal(): void;
}

const ModalContext = createContext<ModalContextType>({
  showModal: () => {},
  closeModal: () => {},
});

export function useModal() {
  return useContext(ModalContext);
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<ModalState | null>(null);

  const showModal = (
    renderer: ModalRenderer,
    options: ShowModalOptions = {},
  ) => {
    setModal({
      renderer,
      options,
    });
  };

  const closeModal = () => {
    setModal(null);
  };

  useEffect(() => {
    console.log("Modal state changed:", modal);
  }, [modal]);

  return (
    <ModalContext.Provider value={{ showModal, closeModal }}>
      {children}

      {modal &&
        createPortal(
          <ModalContainer
            onClose={closeModal}
            closeOnBackdrop={modal.options.closeOnBackdrop}
            closeOnEscape={modal.options.closeOnEscape}
          >
            {modal.renderer({
              close: closeModal,
            })}
          </ModalContainer>,
          document.body,
        )}
    </ModalContext.Provider>
  );
}

interface ModalContainerProps {
  children: React.ReactNode;
  onClose: () => void;

  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
}

export default function ModalContainer({
  children,
  onClose,
  closeOnBackdrop = true,
  closeOnEscape = true,
}: ModalContainerProps) {
  useEffect(() => {
    if (!closeOnEscape) return;

    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", listener);

    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, [closeOnEscape, onClose]);

  useEffect(() => {
    const previous = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => {
        if (closeOnBackdrop) {
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-auto rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
