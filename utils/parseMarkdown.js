module.exports.parseMarkdown = post => {
  let parsedBody = post;
  let title,
    published = false;
  let h1 = [];
  const cleanedPost = parsedBody.split('\n').filter(line => line.length);
  cleanedPost.forEach(line => {
    // Look for h1 headers
    let match = line.match(/^# (.+)/);
    if (match) {
      h1.push(line);
      return;
    }
    // Look for if published
    match = line.match(/^published: (true|false)$/);
    if (match) {
      published = line;
      return;
    }
  });

  if (h1.length > 1) {
    return new Error('There should only be one h1 or title for a post');
  }

  title = h1[0].replace('# ', '');

  if (published) {
    published = published.includes('true') ? true : false;
  }
  return {
    title,
    body: post.slice(h1[0].length + 1),
    published: true
  };
};
