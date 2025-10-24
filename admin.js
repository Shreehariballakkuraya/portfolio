// Check authentication on load
async function checkAuth() {
    try {
        const response = await fetch('/admin/check-auth', {
            credentials: 'include'
        });
        const data = await response.json();
        if (!data.logged_in) {
            window.location.href = 'admin-login.html';
        }
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = 'admin-login.html';
    }
}

// Logout function
async function logout() {
    try {
        await fetch('/admin/logout', {
            method: 'POST',
            credentials: 'include'
        });
        window.location.href = 'admin-login.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Tab switching

function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    // Add active class to the correct button
    const btn = document.getElementById(`tab-btn-${tabName}`);
    if (btn) btn.classList.add('active');
    // Load data for the tab
    loadTabData(tabName);
}

// Attach event listeners to tab buttons

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('tab-btn-profile').addEventListener('click', () => showTab('profile'));
    document.getElementById('tab-btn-skills').addEventListener('click', () => showTab('skills'));
    document.getElementById('tab-btn-projects').addEventListener('click', () => showTab('projects'));
    document.getElementById('tab-btn-education').addEventListener('click', () => showTab('education'));
    document.getElementById('tab-btn-social').addEventListener('click', () => showTab('social'));
});

// Show message
function showMessage(elementId, message, type) {
    const msgEl = document.getElementById(elementId);
    msgEl.textContent = message;
    msgEl.className = `message ${type}`;
    setTimeout(() => {
        msgEl.className = 'message';
    }, 3000);
}

// Load all data on page load
async function loadAllData() {
    await loadProfile();
    await loadSkills();
    await loadProjects();
    await loadEducation();
    await loadSocialLinks();
}

// Load tab-specific data
async function loadTabData(tabName) {
    switch(tabName) {
        case 'profile':
            await loadProfile();
            break;
        case 'skills':
            await loadSkills();
            break;
        case 'projects':
            await loadProjects();
            break;
        case 'education':
            await loadEducation();
            break;
        case 'social':
            await loadSocialLinks();
            break;
    }
}

// Profile Functions
async function loadProfile() {
    try {
        const response = await fetch('/get-profile');
        const profile = await response.json();
        
        document.getElementById('name').value = profile.name || '';
        document.getElementById('role').value = profile.role || '';
        document.getElementById('about_text').value = profile.about_text || '';
        document.getElementById('projects_completed').value = profile.projects_completed || 0;
        document.getElementById('technologies_learned').value = profile.technologies_learned || 0;
        document.getElementById('learning_mindset').value = profile.learning_mindset || 0;
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const profileData = {
        name: document.getElementById('name').value,
        role: document.getElementById('role').value,
        about_text: document.getElementById('about_text').value,
        stats: {
            projects_completed: parseInt(document.getElementById('projects_completed').value),
            technologies_learned: parseInt(document.getElementById('technologies_learned').value),
            learning_mindset: parseInt(document.getElementById('learning_mindset').value)
        }
    };
    
    try {
        const response = await fetch('/update-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(profileData)
        });
        
        const result = await response.json();
        if (result.success) {
            showMessage('profile-message', 'Profile updated successfully!', 'success');
        } else {
            showMessage('profile-message', 'Error updating profile', 'error');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showMessage('profile-message', 'Error updating profile', 'error');
    }
});

// Skills Functions
let skillsData = [];

async function loadSkills() {
    try {
        const response = await fetch('/get-skills');
        skillsData = await response.json();
        renderSkills();
    } catch (error) {
        console.error('Error loading skills:', error);
    }
}

function renderSkills() {
    const container = document.getElementById('skillsList');
    container.innerHTML = '';
    
    skillsData.forEach((skill, index) => {
        const div = document.createElement('div');
        div.className = 'item';
        div.innerHTML = `
            <div>
                <i class="${skill.icon}"></i>
                <strong>${skill.title}</strong>: ${skill.description}
            </div>
            <div class="item-actions">
                <button class="btn btn-small" onclick="openEditSkillModal(${index})">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteSkill(${index})">Delete</button>
            </div>
        `;
        container.appendChild(div);
    });
}

// Edit Skill Modal Logic
window.openEditSkillModal = function(index) {
    const skill = skillsData[index];
    document.getElementById('edit_skill_icon').value = skill.icon;
    document.getElementById('edit_skill_title').value = skill.title;
    document.getElementById('edit_skill_description').value = skill.description;
    document.getElementById('edit_skill_id').value = skill.id;
    document.getElementById('editSkillModal').style.display = 'flex';
}

window.closeEditSkillModal = function() {
    document.getElementById('editSkillModal').style.display = 'none';
}

document.getElementById('editSkillForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const id = document.getElementById('edit_skill_id').value;
    const updatedSkill = {
        icon: document.getElementById('edit_skill_icon').value,
        title: document.getElementById('edit_skill_title').value,
        description: document.getElementById('edit_skill_description').value
    };
    try {
        const response = await fetch(`/update-skill/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(updatedSkill)
        });
        const result = await response.json();
        if (result.success) {
            showMessage('skills-message', 'Skill updated successfully!', 'success');
            closeEditSkillModal();
            await loadSkills();
        } else {
            showMessage('skills-message', 'Error updating skill', 'error');
        }
    } catch (error) {
        showMessage('skills-message', 'Error updating skill', 'error');
    }
});


document.getElementById('skillForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const newSkill = {
        icon: document.getElementById('skill_icon').value,
        title: document.getElementById('skill_title').value,
        description: document.getElementById('skill_description').value
    };
    
    skillsData.push(newSkill);
    await updateSkills();
    
    // Clear form
    e.target.reset();
});

async function deleteSkill(index) {
    if (confirm('Are you sure you want to delete this skill?')) {
        skillsData.splice(index, 1);
        await updateSkills();
    }
}

async function updateSkills() {
    try {
        const response = await fetch('/update-skills', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(skillsData)
        });
        
        const result = await response.json();
        if (result.success) {
            showMessage('skills-message', 'Skills updated successfully!', 'success');
            renderSkills();
        } else {
            showMessage('skills-message', 'Error updating skills', 'error');
        }
    } catch (error) {
        console.error('Error updating skills:', error);
        showMessage('skills-message', 'Error updating skills', 'error');
    }
}

// Projects Functions
let projectsData = [];

async function loadProjects() {
    try {
        const response = await fetch('/get-projects');
        projectsData = await response.json();
        renderProjects();
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

function renderProjects() {
    const container = document.getElementById('projectsList');
    container.innerHTML = '';
    
    projectsData.forEach((project, index) => {
        const div = document.createElement('div');
        div.className = 'item';
        div.innerHTML = `
            <div>
                <strong>${project.title}</strong>: ${project.description}
                <br><small>Tech: ${project.tech_tags ? project.tech_tags.join(', ') : ''}</small>
                ${project.image ? `<br><img src="${project.image.startsWith('http') ? project.image : `/project_images/${project.image}`}" alt="Project Image" style="max-width:100px;max-height:60px;margin-top:5px;">` : ''}
            </div>
            <div class="item-actions">
                <button class="btn btn-danger btn-small" onclick="deleteProject(${index})">Delete</button>
            </div>
        `;
        container.appendChild(div);
    });
}

document.getElementById('projectForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const imageInput = document.getElementById('project_image');
    let imageUrl = ''; // Changed from imageFilename to imageUrl
    
    if (imageInput.files && imageInput.files[0]) {
        const formData = new FormData();
        formData.append('image', imageInput.files[0]);
        try {
            showMessage('projects-message', 'Uploading image to cloud...', 'info');
            const uploadRes = await fetch('/upload-project-image', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            const uploadData = await uploadRes.json();
            if (uploadData.success) {
                // Use the full URL from Cloudinary instead of just the filename
                imageUrl = uploadData.url;
                console.log('Image uploaded successfully:', imageUrl);
                showMessage('projects-message', 'Image uploaded successfully!', 'success');
            } else {
                showMessage('projects-message', 'Image upload failed', 'error');
                return;
            }
        } catch (err) {
            console.error('Image upload error:', err);
            showMessage('projects-message', 'Image upload failed', 'error');
            return;
        }
    }
    
    const newProject = {
        title: document.getElementById('project_title').value,
        description: document.getElementById('project_description').value,
        tech_tags: document.getElementById('project_tech_tags').value.split(',').map(s => s.trim()),
        modal_content: document.getElementById('project_modal_content').value,
        github_link: document.getElementById('project_github_link').value,
        image: imageUrl  // Save the full Cloudinary URL
    };
    
    projectsData.push(newProject);
    await updateProjects();
    e.target.reset();
});

async function deleteProject(index) {
    if (confirm('Are you sure you want to delete this project?')) {
        projectsData.splice(index, 1);
        await updateProjects();
    }
}

async function updateProjects() {
    try {
        const response = await fetch('/update-projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(projectsData)
        });
        const result = await response.json();
        if (result.success) {
            showMessage('projects-message', 'Projects updated successfully!', 'success');
            renderProjects();
        } else {
            showMessage('projects-message', 'Error updating projects', 'error');
        }
    } catch (error) {
        console.error('Error updating projects:', error);
        showMessage('projects-message', 'Error updating projects', 'error');
    }
}

// Education Functions
let educationData = [];

async function loadEducation() {
    try {
        const response = await fetch('/get-education');
        educationData = await response.json();
        renderEducation();
    } catch (error) {
        console.error('Error loading education:', error);
    }
}

function renderEducation() {
    const container = document.getElementById('educationList');
    container.innerHTML = '';
    
    educationData.forEach((edu, index) => {
        const div = document.createElement('div');
        div.className = 'item';
        div.innerHTML = `
            <div>
                <strong>${edu.title}</strong><br>
                <small>${edu.details || ''} - Grade: ${edu.grade}</small>
            </div>
            <div class="item-actions">
                <button class="btn btn-danger btn-small" onclick="deleteEducation(${index})">Delete</button>
            </div>
        `;
        container.appendChild(div);
    });
}

document.getElementById('educationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const newEducation = {
        title: document.getElementById('edu_title').value,
        details: document.getElementById('edu_details').value,
        grade: document.getElementById('edu_grade').value
    };
    
    educationData.push(newEducation);
    await updateEducation();
    
    // Clear form
    e.target.reset();
});

async function deleteEducation(index) {
    if (confirm('Are you sure you want to delete this education entry?')) {
        educationData.splice(index, 1);
        await updateEducation();
    }
}

async function updateEducation() {
    try {
        const response = await fetch('/update-education', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(educationData)
        });
        
        const result = await response.json();
        if (result.success) {
            showMessage('education-message', 'Education updated successfully!', 'success');
            renderEducation();
        } else {
            showMessage('education-message', 'Error updating education', 'error');
        }
    } catch (error) {
        console.error('Error updating education:', error);
        showMessage('education-message', 'Error updating education', 'error');
    }
}

// Social Links Functions
let socialLinksData = [];

async function loadSocialLinks() {
    try {
        const response = await fetch('/get-social-links');
        socialLinksData = await response.json();
        renderSocialLinks();
    } catch (error) {
        console.error('Error loading social links:', error);
    }
}

function renderSocialLinks() {
    const container = document.getElementById('socialList');
    container.innerHTML = '';
    
    socialLinksData.forEach((link, index) => {
        const div = document.createElement('div');
        div.className = 'item';
        div.innerHTML = `
            <div>
                <i class="${link.icon}"></i>
                <strong>${link.platform}</strong>: ${link.url}
            </div>
            <div class="item-actions">
                <button class="btn btn-danger btn-small" onclick="deleteSocialLink(${index})">Delete</button>
            </div>
        `;
        container.appendChild(div);
    });
}

document.getElementById('socialForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const newLink = {
        platform: document.getElementById('social_platform').value,
        url: document.getElementById('social_url').value,
        icon: document.getElementById('social_icon').value
    };
    
    socialLinksData.push(newLink);
    await updateSocialLinks();
    
    // Clear form
    e.target.reset();
});

async function deleteSocialLink(index) {
    if (confirm('Are you sure you want to delete this social link?')) {
        socialLinksData.splice(index, 1);
        await updateSocialLinks();
    }
}

async function updateSocialLinks() {
    try {
        const response = await fetch('/update-social-links', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(socialLinksData)
        });
        
        const result = await response.json();
        if (result.success) {
            showMessage('social-message', 'Social links updated successfully!', 'success');
            renderSocialLinks();
        } else {
            showMessage('social-message', 'Error updating social links', 'error');
        }
    } catch (error) {
        console.error('Error updating social links:', error);
        showMessage('social-message', 'Error updating social links', 'error');
    }
}

// Initialize
checkAuth();
loadAllData();
