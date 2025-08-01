import { Component } from '@angular/core';

@Component({
  selector: 'app-voting-test',
  standalone: true,
  template: `
    <div class="p-8">
      <h1 class="text-2xl font-bold mb-6">Voting Component Test</h1>
      <p class="mb-4">
        To test the voting component, navigate to: 
        <code class="bg-gray-100 px-2 py-1 rounded">/game/voting/{{ '{' }}id{{ '}' }}</code>
      </p>
      <p class="text-gray-600">
        Replace {{ '{' }}id{{ '}' }} with a valid dish vote ID from your backend.
      </p>
    </div>
  `
})
export class VotingTestComponent {}
