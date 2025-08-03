document.querySelectorAll('.dropdown-toggle').forEach(button => {
  button.addEventListener('click', function (e) {
    e.stopPropagation();

    // Close any other open dropdowns
    document.querySelectorAll('.dropdown').forEach(drop => {
      if (drop !== button.parentElement) {
        drop.classList.remove('open');
      }
    });

    // Toggle current dropdown
    button.parentElement.classList.toggle('open');
  });
});

// Close dropdowns if clicking outside
document.addEventListener('click', () => {
  document.querySelectorAll('.dropdown').forEach(drop => {
    drop.classList.remove('open');
  });
});
