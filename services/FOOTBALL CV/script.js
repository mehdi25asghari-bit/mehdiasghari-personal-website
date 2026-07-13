// Get form elements
const form = document.getElementById('visitCardForm');
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const ageInput = document.getElementById('age');
const workInput = document.getElementById('work');
const resumeInput = document.getElementById('resume');
const photoInput = document.getElementById('photoInput');

// Get card elements
const cardName = document.getElementById('cardName');
const cardAge = document.getElementById('cardAge');
const cardWork = document.getElementById('cardWork');
const cardResume = document.getElementById('cardResume');
const cardPhoto = document.getElementById('cardPhoto');

// Update card in real-time as user types
firstNameInput.addEventListener('input', updateCard);
lastNameInput.addEventListener('input', updateCard);
ageInput.addEventListener('input', updateCard);
workInput.addEventListener('input', updateCard);
resumeInput.addEventListener('input', updateCard);
photoInput && photoInput.addEventListener('change', handlePhotoChange);

// Handle form submission
form.addEventListener('submit', function(e) {
    e.preventDefault();
    updateCard();
    // Optional: Add animation or feedback
    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.textContent = 'Visit Card Created!';
    setTimeout(() => {
        submitBtn.textContent = 'Generate Visit Card';
    }, 2000);
});

// Function to update the visit card
function updateCard() {
    const firstName = firstNameInput.value || 'Your';
    const lastName = lastNameInput.value || 'Name';
    const age = ageInput.value || '--';
    const work = workInput.value || 'Your Position';
    const resume = resumeInput.value || 'Your bio will appear here...';

    cardName.textContent = `${firstName} ${lastName}`;
    cardAge.textContent = age;
    cardWork.textContent = work;
    cardResume.textContent = resume;
}

function handlePhotoChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
        cardPhoto.src = ev.target.result;
        const first = firstNameInput.value || '';
        const last = lastNameInput.value || '';
        cardPhoto.alt = `${first} ${last}`.trim() || 'Profile Photo';
    };
    reader.readAsDataURL(file);
}
