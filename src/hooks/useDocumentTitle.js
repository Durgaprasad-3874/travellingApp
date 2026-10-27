import { useEffect } from 'react';

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | Mana Yatra` : 'Mana Yatra: Andhra Pradesh trips, planned for you';
  }, [title]);
}
