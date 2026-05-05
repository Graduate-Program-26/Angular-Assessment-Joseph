import { Component, ElementRef, inject, viewChild, effect, computed } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AppStore } from '../../core/store/app.store';
import { TuiIcon, TuiLoader } from '@taiga-ui/core';
import { injectInfiniteQuery } from '@tanstack/angular-query-experimental';
import { DeezerService } from '../../core/services/deezer.service';
import { lastValueFrom, debounceTime, distinctUntilChanged } from 'rxjs';
import { DurationPipe } from '../../core/pipes/duration.pipe';
import { SearchItem } from '../../core/models/track.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [TuiIcon, TuiLoader, DurationPipe],
  templateUrl: './search.component.html',
})
export class SearchComponent {
  protected readonly store = inject(AppStore);
  private readonly deezer = inject(DeezerService);
  private readonly sentinel = viewChild<ElementRef>('sentinel');

  protected readonly debouncedSearchTerm = toSignal(
    toObservable(this.store.searchTerm).pipe(
      debounceTime(500),
      distinctUntilChanged()
    ),
    { initialValue: this.store.searchTerm() }
  );

  private readonly tracksQuery = injectInfiniteQuery(() => ({
    queryKey: ['search', 'tracks', this.debouncedSearchTerm()],
    queryFn: ({ pageParam }) => lastValueFrom(this.deezer.searchTracks(this.debouncedSearchTerm() || '', pageParam)),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => this.parseNextIndex(lastPage.next),
    enabled: !!this.debouncedSearchTerm(),
  }));

  private readonly artistsQuery = injectInfiniteQuery(() => ({
    queryKey: ['search', 'artists', this.debouncedSearchTerm()],
    queryFn: ({ pageParam }) => lastValueFrom(this.deezer.searchArtists(this.debouncedSearchTerm() || '', pageParam)),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => this.parseNextIndex(lastPage.next),
    enabled: !!this.debouncedSearchTerm(),
  }));

  private readonly albumsQuery = injectInfiniteQuery(() => ({
    queryKey: ['search', 'albums', this.debouncedSearchTerm()],
    queryFn: ({ pageParam }) => lastValueFrom(this.deezer.searchAlbums(this.debouncedSearchTerm() || '', pageParam)),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => this.parseNextIndex(lastPage.next),
    enabled: !!this.debouncedSearchTerm(),
  }));

  protected readonly allTracks = computed(() => this.tracksQuery.data()?.pages.flatMap(p => p.data) ?? []);
  protected readonly allArtists = computed(() => this.artistsQuery.data()?.pages.flatMap(p => p.data) ?? []);
  protected readonly allAlbums = computed(() => this.albumsQuery.data()?.pages.flatMap(p => p.data) ?? []);

  protected readonly firstPageTracks = computed(() => this.tracksQuery.data()?.pages[0]?.data ?? []);
  protected readonly firstPageArtists = computed(() => this.artistsQuery.data()?.pages[0]?.data ?? []);
  protected readonly firstPageAlbums = computed(() => this.albumsQuery.data()?.pages[0]?.data ?? []);

  protected readonly activeQuery = computed(() => {
    const tab = this.store.activeTab();
    if (tab === 'Tracks') return this.tracksQuery;
    if (tab === 'Artists') return this.artistsQuery;
    if (tab === 'Albums') return this.albumsQuery;
    return null;
  });

  constructor() {
    effect(() => {
      const element = this.sentinel()?.nativeElement;
      const query = this.activeQuery();
      if (!element || !query) return;

      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && query.hasNextPage() && !query.isFetchingNextPage()) {
          query.fetchNextPage();
        }
      });

      observer.observe(element);
      return () => observer.disconnect();
    });
  }

  private parseNextIndex(nextUrl?: string): number | undefined {
    if (!nextUrl) return undefined;
    const url = new URL(nextUrl);
    const index = url.searchParams.get('index');
    return index ? parseInt(index, 10) : undefined;
  }

  getHeroTitle(item: SearchItem): string {
    return item.type === 'artist' ? item.name : item.title;
  }

  getHeroSubtitle(item: SearchItem): string {
    if (item.type === 'track') return item.artist.name;
    if (item.type === 'album') return item.artist.name;
    return 'Artist';
  }

  getHeroImage(item: SearchItem): string {
    if (item.type === 'artist') return item.picture_xl || item.picture_medium;
    if (item.type === 'album') return item.cover_medium;
    return item.album.cover_medium;
  }
}
