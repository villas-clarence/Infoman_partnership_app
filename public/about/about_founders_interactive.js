document.addEventListener('DOMContentLoaded', () => {
  // Fade-in animation on scroll for founder cards
  const founderCards = document.querySelectorAll('.founder-card');

  const fadeInOnScroll = () => {
    const windowBottom = window.innerHeight + window.scrollY;
    founderCards.forEach(card => {
      const cardTop = card.offsetTop + card.offsetHeight / 4;
      if (windowBottom > cardTop) {
        card.classList.add('fade-in');
      }
    });
  };

  window.addEventListener('scroll', fadeInOnScroll);
  fadeInOnScroll();

  // Modal popup for founder details
  const modal = document.createElement('div');
  modal.id = 'founder-modal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
  modal.style.display = 'none';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.style.zIndex = '1000';

  const modalContent = document.createElement('div');
  modalContent.style.background = '#3a6a3a';
  modalContent.style.borderRadius = '16px';
  modalContent.style.padding = '20px';
  modalContent.style.maxWidth = '600px';
  modalContent.style.color = '#e6e6d4';
  modalContent.style.position = 'relative';

  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '10px';
  closeButton.style.right = '10px';
  closeButton.style.background = '#7eb883';
  closeButton.style.border = 'none';
  closeButton.style.color = '#e6e6d4';
  closeButton.style.padding = '5px 10px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.borderRadius = '8px';

  closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  modalContent.appendChild(closeButton);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  founderCards.forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const name = card.querySelector('.founder-name').textContent;
      const title = card.querySelector('.founder-title').textContent;
      const description = card.querySelector('.founder-description').innerHTML;

      modalContent.innerHTML = '';
      modalContent.appendChild(closeButton);

      const nameElem = document.createElement('h2');
      nameElem.textContent = name;
      nameElem.style.marginTop = '0';

      const titleElem = document.createElement('h4');
      titleElem.textContent = title;
      titleElem.style.fontStyle = 'italic';
      titleElem.style.color = '#a3c293';

      const descElem = document.createElement('div');
      descElem.innerHTML = description;
      descElem.style.marginTop = '10px';
      descElem.style.textAlign = 'justify';

      modalContent.appendChild(nameElem);
      modalContent.appendChild(titleElem);
      modalContent.appendChild(descElem);

      modal.style.display = 'flex';
    });
  });
});
