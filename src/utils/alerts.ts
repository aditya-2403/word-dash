import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const themeModalParams = {
  customClass: {
    popup: 'io-panel',
    confirmButton: 'io-button io-button-confirm',
    cancelButton: 'io-button io-button-cancel',
  },
  background: '#ffffff',
  color: '#1f2937',
  buttonsStyling: false,
};

export const Alerts = {
  error: (title: string, text?: string) => {
    return MySwal.fire({
      ...themeModalParams,
      icon: 'error',
      title: title,
      text: text,
      confirmButtonText: 'Dash On!',
    });
  },

  warning: (title: string, text?: string) => {
      return MySwal.fire({
      ...themeModalParams,
      icon: 'warning',
      title: title,
      text: text,
      confirmButtonText: 'Got It!', // Changed background to neutral confirm
      customClass: {
         ...themeModalParams.customClass,
         confirmButton: 'io-button io-button-cancel'
      }
    });
  },

  info: (title: string, text?: string) => {
    return MySwal.fire({
      ...themeModalParams,
      icon: 'info',
      title: title,
      text: text,
      confirmButtonText: 'Okay',
      customClass: {
         ...themeModalParams.customClass,
         confirmButton: 'io-button io-button-cancel'
      }
    });
  },

  confirmKick: (playerName: string) => {
     return MySwal.fire({
      ...themeModalParams,
      icon: 'warning',
      title: 'Banish Player?',
      text: `Are you absolutely sure you want to kick ${playerName}?`,
      showCancelButton: true,
      confirmButtonText: 'Yes, Kick',
      cancelButtonText: 'Cancel'
    });
  }
};
