function getRecommendedResources(category, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/api/resources?category=${encodeURIComponent(category)}`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            callback(null, data);
        } else {
            callback(new Error('Failed to load resources'));
        }
    };
    
    xhr.onerror = function() {
        callback(new Error('Network error'));
    };
    
    xhr.send();
}