import Swal from "sweetalert2";
import "../globals.css";
import { useRouter } from "next/router"; // Import Next.js router

// Success Alert
export const showSuccessAlert = (title: string, text?: string) => {
  Swal.fire({
    icon: "success",
    title,
    text,
    position: "top-end",
    toast: true,
    timer: 2000,
    timerProgressBar: true,
    showConfirmButton: false,
    background: "#f0fff4",
    customClass: {
      popup: "swal-toast",
      title: "swal-toast-title",
      icon: "swal-toast-icon",
    },
  });
};

export const showErrorAlert = (
  title: string,
  text?: string,
  // buttonText: string = "Try Again",
  redirectUrl?: string,
  showCancelButton: boolean = false,
  cancelText: string = "Cancel",
  onConfirm?: () => void,
) => {
  Swal.fire({
    icon: "error",
    title,
    text,
    position: "top-end",
    toast: true,
    showConfirmButton: false,
    // confirmButtonText: buttonText,
    showCancelButton: false,
    timer: 2000,
    cancelButtonText: cancelText,
    background: "#fff5f5",
    allowOutsideClick: false,
    buttonsStyling: false,
    customClass: {
      popup: "swal-toast",
      title: "swal-toast-title",
      icon: "swal-toast-icon",
      confirmButton: "swal-custom-button",
      cancelButton: "swal-cancel-button",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      if (onConfirm) onConfirm();
      if (redirectUrl) window.location.href = redirectUrl;
    }
  });
};

export const showAuthErrorAlert = (
  title: string,
  text?: string,
  buttonText: string = "Try Again",
  redirectUrl?: string, // Optional redirection URL
  showCancelButton: boolean = false, // Optional cancel button
  cancelText: string = "Cancel", // Custom cancel button text
  onConfirm?: () => void, // Optional callback before redirect
) => {
  Swal.fire({
    icon: "error",
    title,
    text,
    showConfirmButton: true,
    confirmButtonText: buttonText,
    showCancelButton, // Conditionally show the cancel button
    cancelButtonText: cancelText, // Set cancel button text
    allowOutsideClick: false,
    buttonsStyling: false,
    customClass: {
      confirmButton: "swal-custom-button",
      cancelButton: "swal-cancel-button", // Ensure you style this in CSS
    },
  }).then((result) => {
    if (result.isConfirmed) {
      if (onConfirm) onConfirm(); // Run optional callback
      if (redirectUrl) window.location.href = redirectUrl;
    }
  });
};
