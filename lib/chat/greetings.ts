export function greetingFor(pathname: string): string {
  if (pathname === '/' || pathname === '') {
    return "Hey — looking to clean up your CRM or build something new? I'm happy to help.";
  }
  if (pathname.startsWith('/pipedrive-training')) {
    return "Thinking about Pipedrive training for your team? Ask me anything.";
  }
  if (pathname.startsWith('/pipedrive-setup')) {
    return "Setting up Pipedrive? I can walk you through what's included.";
  }
  if (pathname.startsWith('/pipedrive-implementation')) {
    return "Planning a Pipedrive implementation? Happy to talk scope.";
  }
  if (pathname.startsWith('/pipedrive-automation')) {
    return "Want to automate the boring bits in Pipedrive? I can help.";
  }
  if (pathname.startsWith('/pipedrive-integration')) {
    return "Connecting Pipedrive to other tools? I've probably seen your stack before.";
  }
  if (pathname.startsWith('/pipedrive-expert')) {
    return "Looking for a senior Pipedrive expert? I can point you in the right direction.";
  }
  if (pathname.startsWith('/pipedrive-help')) {
    return "Need a quick hand with Pipedrive? Ask away.";
  }
  if (pathname.startsWith('/pipedrive-partner')) {
    return "Curious about Pipedrive Partner benefits? Happy to explain.";
  }
  if (pathname.startsWith('/pipedrive-consultant')) {
    return "Want to talk through what a Pipedrive consultant engagement looks like?";
  }
  if (pathname.startsWith('/website-design')) {
    return "Need a company website in 7 days? I can give you the quick version.";
  }
  if (pathname.startsWith('/ai-consultants')) {
    return "Thinking about AI in your sales process? Ask me what's realistic.";
  }
  if (pathname.startsWith('/zapier-consultants')) {
    return "Got a tricky Zapier problem? Tell me what you're trying to do.";
  }
  if (pathname.startsWith('/active-campaign')) {
    return "ActiveCampaign question? I can help.";
  }
  if (pathname.startsWith('/free-pipedrive-trial-extended')) {
    return "Want the 30-day extended Pipedrive trial? I can explain how it works.";
  }
  if (pathname.startsWith('/contact')) {
    return "Before you fill in the form — anything I can answer here?";
  }
  if (pathname.startsWith('/case-studies') || pathname.startsWith('/portfolio')) {
    return "Seen a project that looks like yours? Ask me about it.";
  }
  if (pathname.startsWith('/testimonials')) {
    return "Want to talk about what we could do for your team? Happy to chat.";
  }
  if (pathname.startsWith('/blog')) {
    return "Reading up? Ask me anything — I'll keep it short.";
  }
  return "Hi — any questions about what we do?";
}
